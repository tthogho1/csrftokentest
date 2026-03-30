module.exports = {
  default: {
    require: ['step-definitions/**/*.steps.js', 'step-definitions/world.js'],
    paths: ['../features/**/*.feature'],
    format: ['progress', 'html:reports/cucumber-report.html'],
    publishQuiet: true
  }
}
