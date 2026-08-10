#!/usr/bin/env bash
# dev-server.sh -- one entry point for the Astro dev server.
#
#   ./dev-server.sh            show what is (or is not) running, and what to type next
#   ./dev-server.sh start      start it detached, on port 4321
#   ./dev-server.sh watch      attached: stream the server log until you stop it
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
#
# WHERE OUTPUT GOES  (this changed in Astro 7)
#   Server-side console.log + errors -- from .astro frontmatter, endpoints,
#     getStaticPaths, astro.config -- used to stream to the terminal running
#     `pnpm dev`. The daemon has no terminal, so they go to its log instead:
#     `./dev-server.sh logs -f`, or `./dev-server.sh watch` for the full
#     old-style foreground session.
#   Browser console.log stays in the browser devtools, as it always has.
#
# HMR is unaffected by any of this. The server does its own file watching and
# pushes updates over its own websocket, so edits hot-reload whether or not
# this script is still running.

set -euo pipefail

cd "$(dirname "$0")"

DEFAULT_PORT=4321
PREVIEW_PORT=4322
PORT="$DEFAULT_PORT"
SWEEP_EXTRA=""

CMD="${1:-status}"
case "$CMD" in
  start|stop|restart|status|logs|watch) shift || true ;;
  -h|--help)
    sed -n '2,40p' "$0" | sed 's/^# \{0,1\}//'
    exit 0 ;;
  # No subcommand given, but flags were -- treat as status.
  -*) CMD="status" ;;
  *)
    echo "dev-server: unknown command '$CMD'" >&2
    echo "  Try: ./dev-server.sh [start|stop|restart|status|watch|logs]" >&2
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

# OSC 8 terminal hyperlink, so the URL is click/cmd-click-able.
#
# The escape sequence is baked into the characters we print, which means the
# link keeps working in scrollback long after this script exits. Clickability
# is a property of the emitted text, not of a running process -- nothing has
# to stay resident to keep it live.
#
# Guarded on stdout being a TTY: piping or redirecting would otherwise capture
# raw escape bytes. Terminals that don't understand OSC 8 (and most that do)
# still autolink a bare URL, so the fallback loses nothing.
hyperlink() {  # hyperlink <url> [label]
  local url="$1" label="${2:-$1}"
  if [ -t 1 ]; then
    printf '\033]8;;%s\033\\%s\033]8;;\033\\' "$url" "$label"
  else
    printf '%s' "$label"
  fi
}

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
    printf '  url  %s\n' "$(hyperlink "http://localhost:$PORT/")"
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
  printf '  Ready:  %s\n' "$(hyperlink "$url")"
  echo "  Running detached - closing this terminal will NOT stop it."
  echo "  HMR is live: the server watches files itself, so edits hot-reload"
  echo "  even though this script has exited."
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

# Attached mode -- the classic `pnpm dev` foreground experience, restored.
#
# Astro 7's daemon detaches from your terminal, so server-side console.log and
# errors no longer stream to the shell you launched from; they go to the
# daemon's log. `watch` tails that log live, so you get the old behaviour back:
# output appears as it happens, and the session runs until you stop it.
#
# Deliberately NOT the default -- a resident process is exactly what `start`
# exists to avoid. This is for when you are actively working.
#
# Heartbeat is a real HTTP request, not just "is the port open": a wedged dev
# server keeps its socket bound long after it stops serving. It exits on its
# own if the server dies, so the watcher never outlives what it watches.
STREAM_PID=""

# Kill a process and everything it spawned. Killing only the immediate PID
# leaves the grandchildren running: `stream_logs &` is a subshell whose real
# work is a `pnpm exec astro dev logs --follow` two levels down, and pnpm
# itself re-execs. Orphaning those is the exact bug this script exists to
# prevent, so walk the tree.
kill_tree() {  # kill_tree <pid>
  local pid="$1" child
  [ -n "$pid" ] || return 0
  for child in $(pgrep -P "$pid" 2>/dev/null); do
    kill_tree "$child"
  done
  kill -TERM "$pid" 2>/dev/null || true
}

cleanup_stream() {
  [ -n "$STREAM_PID" ] || return 0
  kill_tree "$STREAM_PID"
  # Reap it here, quietly. Otherwise bash notices the dead job on its own
  # schedule and prints a "Terminated:" notice across the output.
  wait "$STREAM_PID" 2>/dev/null || true
  STREAM_PID=""
}

# Astro 7 emits a mix of JSON envelopes and pre-formatted lines. Unwrap the
# former, pass the latter through untouched, and stay line-buffered so output
# appears as it happens rather than in 4KB gulps.
stream_logs() {
  detect_supervision
  {
    if [ "$SUPERVISED" = "yes" ]; then
      pnpm exec astro dev logs --follow 2>&1
    else
      [ -f "$LEGACY_LOG" ] || { mkdir -p "$(dirname "$LEGACY_LOG")"; : > "$LEGACY_LOG"; }
      tail -n 20 -f "$LEGACY_LOG" 2>&1
    fi
  } | while IFS= read -r line; do
    printf '%s' "$line" | pretty
  done
}

cmd_watch() {
  require_toolchain

  if printf '%s' "$(astro_status_msg)" | grep -q "No dev server is running"; then
    cmd_start
  else
    echo "dev-server: attaching to the running server."
  fi

  local url="http://localhost:$PORT/"
  local interval="${DEV_SERVER_INTERVAL:-60}"
  local interactive=""
  [ -t 0 ] && [ -t 1 ] && interactive=1

  # Ctrl-C detaches rather than stops. Losing your server because you wanted to
  # stop watching would be a nasty surprise; `q` is the explicit kill.
  detach_notice() {
    cleanup_stream
    printf '\n  detached - server still running at %s\n' "$(hyperlink "$url")"
    printf '  Stop it with: ./dev-server.sh stop%s\n' \
      "$([ "$PORT" != "$DEFAULT_PORT" ] && echo " --port $PORT")"
    exit 0
  }
  trap detach_notice INT TERM
  trap cleanup_stream EXIT

  printf '  streaming server log from %s\n' "$(hyperlink "$url")"
  if [ -n "$interactive" ]; then
    printf '  [q] stop server and exit   [d] detach (leave it running)   Ctrl-C detaches\n'
  fi
  printf '  heartbeat every %ss. Browser console.log stays in the browser devtools.\n' "$interval"
  printf '  ----------------------------------------------------------------------\n'

  stream_logs &
  STREAM_PID=$!
  # Drop it from the job table so bash does not print a "Terminated:"
  # job-control notice over the output when we kill it. kill_tree still
  # works -- it addresses the pid directly, not the job spec.
  disown "$STREAM_PID" 2>/dev/null || true

  local started_at; started_at=$(date +%s)
  # Declared out here: the heartbeat test below reads $key on every iteration,
  # and under `set -u` a non-interactive run would otherwise die on the first
  # tick -- killing the loop but leaving the log streamer orphaned.
  local key=""
  while :; do
    key=""
    # Wait out the interval, but stay responsive to a keypress.
    if [ -n "$interactive" ]; then
      read -rsn1 -t "$interval" key 2>/dev/null || true
      case "$key" in
        q|Q) printf '\n'; cleanup_stream; cmd_stop; exit 0 ;;
        d|D) detach_notice ;;
      esac
    else
      sleep "$interval"
    fi

    local pids; pids="$(port_pids "$PORT")"
    if [ -z "$pids" ]; then
      printf '\n  server on port %s is GONE (stopped or crashed) - exiting watch.\n' "$PORT"
      cleanup_stream
      exit 1
    fi

    # Only emit a heartbeat on a real interval tick, not on every keypress.
    if [ -z "$key" ] || [ -z "$interactive" ]; then
      local code="---" ms="--"
      if have curl; then
        local probe
        probe="$(curl -sS -o /dev/null -m 5 -w '%{http_code} %{time_total}' "$url" 2>/dev/null || echo "000 0")"
        code="${probe%% *}"
        ms="$(awk -v t="${probe##* }" 'BEGIN{printf "%d", t*1000}')"
      fi
      local up=$(( $(date +%s) - started_at ))
      printf '  -- %s %s :%s pid %s  up %dm%02ds  HTTP %s in %sms --\n' \
        "$(date +%H:%M:%S)" \
        "$([ "$code" = "200" ] && echo "UP" || echo "SICK")" \
        "$PORT" "$(echo "$pids" | head -1)" $((up/60)) $((up%60)) "$code" "$ms"
    fi
  done
}

case "$CMD" in
  status)  cmd_status ;;
  watch)   cmd_watch ;;
  start)   cmd_start ;;
  stop)    cmd_stop ;;
  restart) cmd_stop; echo; cmd_start ;;
  logs)    require_toolchain; show_logs ;;
esac
