const client = require("prom-client");

client.collectDefaultMetrics();

const apiResponseTime = new client.Histogram({
  name: "mediqueue_api_response_time_ms",
  help: "API response time in milliseconds",
  labelNames: ["method", "route", "status"],
  buckets: [10, 30, 50, 100, 200, 300, 500, 1000, 3000],
});

const queueCountGauge = new client.Gauge({
  name: "mediqueue_queue_count",
  help: "Current waiting queue count",
  labelNames: ["department"],
});

const observeRequest = (req, res, durationMs) => {
  apiResponseTime.observe(
    {
      method: req.method,
      route: req.route?.path || req.path,
      status: String(res.statusCode),
    },
    durationMs
  );
};

module.exports = { client, queueCountGauge, observeRequest };
