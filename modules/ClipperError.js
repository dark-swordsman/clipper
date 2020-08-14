class ClipperError extends Error {
  constructor ({errorType, errorLocation, message, exit}) {
    console.error(`\n\nCLIPPER ERROR: ${message}\n`);
    console.error(`    TYPE: ${errorType}`);
    console.error(`    LOCATION: ${errorLocation}`);
    console.error(`    MESSAGE: "${message}"`);
    console.error(`    EXIT: ${exit}`);
    if (exit) {
      console.log('\nexiting program...\n')
      process.exit(1);
    } else {
      console.error('\ncontinuing program...\n');
    }
  }
}

module.exports = ClipperError;