require("dotenv").config();
const { redis } = require("./utils/redis");
const Result = require("./Models/Result");
const connectDB = require("./config/database");
const winston = require("winston");

// Connect to MongoDB
connectDB();

// Set up logger to log only to the console
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(), // Log to console only
  ],
});

// Constants
const QUEUE_KEY = process.env.QUEUE_KEY;
const BULK_WRITE_THRESHOLD = process.env.BULK_WRITE_THRESHOLD;

// Validate required environment variables
if (!QUEUE_KEY) {
  logger.error("QUEUE_KEY is not defined in environment variables");
  process.exit(1);
}

// Perform a bulk write to MongoDB
async function bulkWriteSubmissions(submissions) {
  try {
    logger.info(`Preparing bulk write for ${submissions.length} submissions`);
    const bulkOps = submissions.map((submission) => ({
      updateOne: {
        filter: {
          examName: submission.examName,
          examTakenBy: submission.examTakenBy,
        },
        update: {
          timeTaken: submission.timeTaken,
          answers: submission.answers,
          userEnrolledInExam: true,
          paperSubmittedInExam: true,
          violences: submission.violences,
        },
        upsert: true,
      },
    }));

    await Result.bulkWrite(bulkOps);
    logger.info(`Bulk write successful for ${submissions.length} submissions`);
  } catch (error) {
    logger.error("Error in bulk writing submissions: " + error.message);
  }
}

// Process Redis queue
async function processQueue() {
  logger.info("Worker is enabled and waiting for submissions...");

  while (true) {
    try {
      const queueLength = await redis.llen(QUEUE_KEY);
      logger.info(`Queue Length: ${queueLength}`);
      logger.info(`Bulk Write Threshold: ${BULK_WRITE_THRESHOLD}`);
      if (queueLength >= BULK_WRITE_THRESHOLD) {
        logger.info(
          `Threshold reached, processing ${queueLength} submissions...`
        );
        const submissionsToWrite = await redis.lrange(
          QUEUE_KEY,
          0,
          BULK_WRITE_THRESHOLD - 1
        );
        // Remove processed submissions from the queue
        await redis.ltrim(QUEUE_KEY, BULK_WRITE_THRESHOLD, -1); // Remove processed submissions from the queue

        const parsedSubmissions = submissionsToWrite.map((item) =>
          JSON.parse(item)
        );
        // Perform bulk write
        await bulkWriteSubmissions(parsedSubmissions);
      } else {
        logger.info(`Not enough submissions for bulk write.`);
        logger.info("Queue is empty. Waiting for 60 seconds...");
        await new Promise((resolve) => setTimeout(resolve, 60000));
        continue;
      }
    } catch (error) {
      logger.error("Error processing queue: " + error.message);
    }
  }
}

// Start the worker
processQueue().catch((error) => {
  logger.error("Worker failed: " + error.message);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("Shutting down gracefully...");
  process.exit(0);
});
