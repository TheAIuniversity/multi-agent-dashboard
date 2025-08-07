const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  /**
   * Sort test files by priority:
   * 1. Unit tests (fastest)
   * 2. Integration tests
   * 3. E2E tests (slowest)
   * 4. Performance tests (resource intensive)
   */
  sort(tests) {
    const getPriority = (testPath) => {
      if (testPath.includes('/unit/')) return 1;
      if (testPath.includes('/integration/')) return 2;
      if (testPath.includes('/e2e/')) return 3;
      if (testPath.includes('/performance/')) return 4;
      if (testPath.includes('/security/')) return 2; // Run with integration tests
      return 5; // Other tests last
    };
    
    return tests.sort((testA, testB) => {
      const priorityA = getPriority(testA.path);
      const priorityB = getPriority(testB.path);
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // Same priority, sort alphabetically
      return testA.path.localeCompare(testB.path);
    });
  }
}

module.exports = CustomSequencer;