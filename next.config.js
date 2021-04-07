const withTM = require("next-transpile-modules")([
    "react-financial-charts",
    "@react-financial-charts/annotations",
    "@react-financial-charts/axes",
    "@react-financial-charts/coordinates",
    "@react-financial-charts/core",
    "@react-financial-charts/indicators",
    "@react-financial-charts/interactive",
    "@react-financial-charts/scales",
    "@react-financial-charts/series",
    "@react-financial-charts/tooltip",
    "@react-financial-charts/utils"
]);

module.exports = withTM({
    publicRuntimeConfig: {
        HOSTNAME: process.env.HOSTNAME,
    },
});