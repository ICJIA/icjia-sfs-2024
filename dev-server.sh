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
# --all is ours, not a flag astro understands.
ARGS=()
for arg in "$@"; do [ "$arg" = "--all" ] || ARGS+=("$arg"); done

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

# Astro exits 0 from `dev status`/`dev stop` whether or not a server is up, so
# every check below branches on the message text instead of the exit code.
astro_status_msg() {
  usable || { echo "No dev server is running."; return 0; }
  pnpm exec astro dev status 2>/dev/null || true
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
  local msg pids
  msg="$(astro_status_msg)"
  if printf '%s' "$msg" | grep -q "No dev server is running"; then
    echo "STOPPED  no Astro-managed dev server"
  else
    echo "RUNNING  Astro-managed dev server"
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

  echo "dev-server: starting on port $PORT ..."
  if ! pnpm exec astro dev --background ${ARGS+"${ARGS[@]}"} >/dev/null 2>&1; then
    echo "dev-server: astro failed to start. Recent logs:" >&2
    pnpm exec astro dev logs 2>&1 | tail -20 >&2 || true
    exit 1
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

  if usable; then
    local msg
    msg="$(pnpm exec astro dev stop 2>/dev/null || true)"
    if printf '%s' "$msg" | grep -q "No dev server is running"; then
      echo "dev-server: no Astro-managed server was running."
    else
      printf '%s' "$msg" | pretty | sed 's/^/  /'
      SWEPT=1
    fi
  else
    echo "dev-server: skipping 'astro dev stop' (pnpm or node_modules missing)."
  fi

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
  logs)    require_toolchain; pnpm exec astro dev logs ${ARGS+"${ARGS[@]}"} ;;
esac
