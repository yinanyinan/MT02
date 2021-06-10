import 'core-js';
require('zone.js/dist/zone');
if (process.env.NODE_ENV === 'production') {
  // Production
} else {
  // Development
  Error['stackTraceLimit'] = Infinity;
  require('zone.js/dist/long-stack-trace-zone');
}

(window as any).global = window;
(window as any).process = {
  env: { DEBUG: undefined },
};