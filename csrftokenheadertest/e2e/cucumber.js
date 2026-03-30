module.exports = {
  default: {
    require: [
      'step-definitions/world.js',
      'step-definitions/**/*.steps.js',
    ],
    paths: ['../features/**/*.feature'],
    format: ['progress', 'html:reports/cucumber-report.html'],
    publishQuiet: true,
  },
}
