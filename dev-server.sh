#!/usr/bin/env bash
# dev-server.sh -- one entry point for the Astro dev server.
#
#   ./dev-server.sh            show what is (or is not) running, and what to type next
#   ./dev-server.sh start      start it detached, on port 4321
#   ./dev-server.sh stop       stop it and free the port
#   ./dev-server.sh restart    stop, then start
#   ./dev-server.sh logs       tail the background server's log (-f to follow)
#
# Extra flags pass through to `astro dev`, e.g.
#   ./dev-server.sh start --port 5000 --host --open
#   ./dev-server.sh stop --port 5000
#   ./dev-server.sh stop --all          also sweep the preview port (4322)
#
# WHY THIS EXISTS
# Astro 7 supervises the dev server itself: `astro dev --background` writes a
# lock file, and `astro dev stop` is the only thing that reliably shuts it
# down. Closing the terminal that launched it does NOT stop it -- the process
# keeps holding the port. On top of that, Astro only knows about servers it
# started, so a stray `pnpm dev` or an old `astro preview` can squat on the
# port invisibly. `stop` handles both: the managed server AND anything else on
# the socket.
#
# The bare command deliberately reports status rather than toggling. A toggle
# does the wrong thing precisely when you have lost track of the state.

set -euo pipefail

cd "$(dirname "$0")"

DEFAULT_PORT=4321
PREVIEW_PORT=4322
PORT="$DEFAULT_PORT"
SWEEP_EXTRA=""

CMD="${1:-status}"
case "$CMD" in
  start|stop|restart|status|logs) shift || true ;;
  -h|--help)
    sed -n '2,28p' "$0" | sed 's/^# \{0,1\}//'
    exit 0 ;;
  # No subcommand given, but flags were -- treat as status.
  -*) CMD="status" ;;
  *)
    echo "dev-server: unknown command '$CMD'" >&2
    echo "  Try: ./dev-server.sh [start|stop|restart|status|logs]" >&2
    exit 2 ;;
esac

# Pull --port / --all out of the remaining args so we probe the right socket.
# Everything is still forwarded to astro untouched.
prev=""
for arg in "$@"; do
  if [ "$prev" = "--port" ]; then PORT="$arg"; fi
  case "$arg" in
    --port=*) PORT="${arg#--port=}" ;;
    --all)    SWEEP_EXTRA="$PREVIEW_PORT" ;;
  esac
  prev="$arg"
done
# Rebuild the passthrough list: drop --all (ours, not Astro's) and strip any
# --port/--port=N, because we re-supply the parsed $PORT exactly once below.
# Forwarding both yields `astro dev --port 4321 --port 5000`, which Astro
# resolves by silently falling back to its default port.
ARGS=()
skip_next=""
for arg in "$@"; do
  if [ -n "$skip_next" ]; then skip_next=""; continue; fi
  case "$arg" in
    --all)     continue ;;
    --port)    skip_next=1; continue ;;
    --port=*)  continue ;;
  esac
  ARGS+=("$arg")
done

have()  { command -v "$1" >/dev/null 2>&1; }
usable() { have pnpm && [ -d node_modules ]; }

# Astro's dev subcommands emit a JSON envelope
# ({"message":"...","label":"SKIP_FORMAT","level":"info"}). Unwrap it to the
# human-readable message, and turn the escaped newlines it embeds into real
# ones. Falls back to printing the raw line if the shape ever changes.
pretty() {
  local raw msg
  raw="$(cat)"
  msg="$(printf '%s' "$raw" \
    | sed -n 's/.*"message"[[:space:]]*:[[:space:]]*"\(.*\)","label".*/\1/p' \
    | head -1)"
  if [ -n "$msg" ]; then
    printf '%b\n' "$msg"
  else
    printf '%s\n' "$raw"
  fi
}

# Astro 7 supervises the dev server (`--background`, `dev stop`, `dev status`).
# Astro 6 has none of that, so we background it ourselves and treat the port as
# the source of truth. Detect once, from the CLI's own help output, rather than
# parsing a version number -- that keeps working if the flag lands in a
# backport. Result is cached for the life of the script.
SUPERVISED=""
detect_supervision() {
  [ -n "$SUPERVISED" ] && return 0
  if ! usable; then SUPERVISED="no"; return 0; fi
  if pnpm exec astro dev --help 2>/dev/null | grep -q -- "--background"; then
    SUPERVISED="yes"
  else
    SUPERVISED="no"
  fi
}

# Astro 6 fallback: our own log so `logs` works on both majors. Lives under
# node_modules/ so it needs no .gitignore entry.
LEGACY_LOG="node_modules/.astro/dev-server.log"

# Astro exits 0 from `dev status`/`dev stop` whether or not a server is up, so
# every check below branches on the message text instead of the exit code.
astro_status_msg() {
  usable || { echo "No dev server is running."; return 0; }
  detect_supervision
  if [ "$SUPERVISED" = "yes" ]; then
    pnpm exec astro dev status 2>/dev/null || true
  else
    # Astro 6: no supervisor to ask. The socket is the only truth.
    if [ -n "$(port_pids "$PORT")" ]; then
      echo "Dev server running at http://localhost:$PORT (pid $(port_pids "$PORT" | tr '\n' ' ')unsupervised)"
    else
      echo "No dev server is running."
    fi
  fi
}

port_pids() {
  have lsof || return 0
  lsof -iTCP:"$1" -sTCP:LISTEN -nP -t 2>/dev/null || true
}

require_toolchain() {
  if ! have pnpm; then
    echo "dev-server: pnpm not found." >&2
    echo "  Install via: corepack enable && corepack prepare pnpm@latest --activate" >&2
    exit 1
  fi
  if [ ! -d node_modules ]; then
    echo "dev-server: node_modules missing -- running 'pnpm install' first."
    pnpm install
  fi
}

# `logs` on either major: Astro 7 has its own log store; on 6 we tail the file
# the start path redirected into. Honors -f/--follow in both cases.
show_logs() {
  detect_supervision
  local follow=""
  for a in ${ARGS+"${ARGS[@]}"}; do
    case "$a" in -f|--follow) follow=1 ;; esac
  done

  if [ "$SUPERVISED" = "yes" ]; then
    pnpm exec astro dev logs ${ARGS+"${ARGS[@]}"} 2>&1 || true
    return 0
  fi

  if [ ! -f "$LEGACY_LOG" ]; then
    echo "dev-server: no log yet at $LEGACY_LOG (start the server first)."
    return 0
  fi
  if [ -n "$follow" ]; then tail -f "$LEGACY_LOG"; else tail -50 "$LEGACY_LOG"; fi
}

# SIGTERM, then SIGKILL, then confirm the socket is actually released.
sweep_port() {
  local port="$1" pids still
  pids="$(port_pids "$port")"
  [ -z "$pids" ] && return 0

  echo "  port $port held by pid(s): $(echo "$pids" | tr '\n' ' ')- terminating"
  kill -TERM $pids 2>/dev/null || true
  still=""
  for _ in 1 2 3; do
    sleep 1
    still="$(port_pids "$port")"
    [ -z "$still" ] && break
  done
  if [ -n "$still" ]; then
    echo "  SIGTERM did not free port $port - sending SIGKILL"
    kill -KILL $still 2>/dev/null || true
    sleep 1
  fi
  SWEPT=1
}

cmd_status() {
  local msg pids kind
  detect_supervision
  [ "$SUPERVISED" = "yes" ] && kind="Astro-supervised" || kind="unsupervised (Astro 6)"

  msg="$(astro_status_msg)"
  if printf '%s' "$msg" | grep -q "No dev server is running"; then
    echo "STOPPED  no dev server [$kind mode]"
  else
    echo "RUNNING  dev server [$kind mode]"
    printf '%s' "$msg" | pretty | sed 's/^/  /'
  fi

  pids="$(port_pids "$PORT")"
  if [ -n "$pids" ]; then
    echo "  port $PORT in use by pid(s): $(echo "$pids" | tr '\n' ' ')"
  else
    echo "  port $PORT free"
  fi

  local pflag=""
  [ "$PORT" != "$DEFAULT_PORT" ] && pflag=" --port $PORT"

  echo
  if printf '%s' "$msg" | grep -q "No dev server is running" && [ -z "$pids" ]; then
    echo "  Start it:  ./dev-server.sh start$pflag"
  else
    echo "  Stop it:   ./dev-server.sh stop$pflag"
    echo "  Logs:      ./dev-server.sh logs -f"
  fi
}

cmd_start() {
  require_toolchain

  local msg
  msg="$(astro_status_msg)"
  if ! printf '%s' "$msg" | grep -q "No dev server is running"; then
    echo "dev-server: already running."
    printf '%s' "$msg" | pretty | sed 's/^/  /'
    echo "  Stop it with: ./dev-server.sh stop"
    return 0
  fi

  # Astro's lock knows nothing about a stray `pnpm dev`; clear the socket.
  if [ -n "$(port_pids "$PORT")" ]; then
    echo "dev-server: port $PORT busy before start - clearing"
    sweep_port "$PORT"
    if [ -n "$(port_pids "$PORT")" ]; then
      echo "dev-server: port $PORT still in use - bailing." >&2
      exit 1
    fi
  fi

  detect_supervision
  echo "dev-server: starting on port $PORT ..."
  if [ "$SUPERVISED" = "yes" ]; then
    if ! pnpm exec astro dev --background --port "$PORT" ${ARGS+"${ARGS[@]}"} >/dev/null 2>&1; then
      echo "dev-server: astro failed to start. Recent logs:" >&2
      show_logs | tail -20 >&2
      exit 1
    fi
  else
    # Astro 6: detach it ourselves so the terminal comes back either way.
    mkdir -p "$(dirname "$LEGACY_LOG")"
    : > "$LEGACY_LOG"
    nohup pnpm exec astro dev --port "$PORT" ${ARGS+"${ARGS[@]}"} \
      >>"$LEGACY_LOG" 2>&1 &
    disown 2>/dev/null || true
  fi

  local url="http://localhost:$PORT/" ready=""
  for _ in $(seq 1 60); do
    if have curl; then
      curl -fsS -o /dev/null --max-time 3 "$url" 2>/dev/null && { ready=1; break; }
    else
      [ -n "$(port_pids "$PORT")" ] && { ready=1; break; }
    fi
    sleep 0.5
  done

  if [ -z "$ready" ]; then
    echo "dev-server: did not become ready in ~30s. Recent logs:" >&2
    pnpm exec astro dev logs 2>&1 | tail -20 >&2 || true
    exit 1
  fi

  # Carry --port into the hints, or copy-pasting them sweeps the wrong socket.
  local pflag=""
  [ "$PORT" != "$DEFAULT_PORT" ] && pflag=" --port $PORT"

  echo
  echo "  Ready:  $url"
  echo "  Running detached - closing this terminal will NOT stop it."
  echo
  echo "    Stop:    ./dev-server.sh stop$pflag"
  echo "    Status:  ./dev-server.sh status$pflag"
  echo "    Logs:    ./dev-server.sh logs -f"
  echo
}

cmd_stop() {
  SWEPT=""

  detect_supervision
  if [ "$SUPERVISED" = "yes" ]; then
    local msg
    msg="$(pnpm exec astro dev stop 2>/dev/null || true)"
    if printf '%s' "$msg" | grep -q "No dev server is running"; then
      echo "dev-server: no Astro-managed server was running."
    else
      printf '%s' "$msg" | pretty | sed 's/^/  /'
      SWEPT=1
    fi
  fi
  # On Astro 6 there is no supervisor; the port sweep below is the whole story.

  sweep_port "$PORT"
  for extra in $SWEEP_EXTRA; do sweep_port "$extra"; done

  local failed=""
  for p in "$PORT" $SWEEP_EXTRA; do
    if [ -n "$(port_pids "$p")" ]; then
      echo "dev-server: port $p is STILL in use." >&2
      lsof -iTCP:"$p" -sTCP:LISTEN -nP 2>/dev/null | sed 's/^/  /' >&2 || true
      failed=1
    fi
  done
  [ -n "$failed" ] && { echo "dev-server: could not fully clean up." >&2; exit 1; }

  if [ -n "$SWEPT" ]; then
    echo "dev-server: stopped. Port $PORT is free."
  else
    echo "dev-server: nothing was running. Port $PORT is free."
  fi
}

case "$CMD" in
  status)  cmd_status ;;
  start)   cmd_start ;;
  stop)    cmd_stop ;;
  restart) cmd_stop; echo; cmd_start ;;
  logs)    require_toolchain; show_logs ;;
esac
