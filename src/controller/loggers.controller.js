// ERROR
const loggerErrorCtrl = async (req, res) => {
    try {
        throw new Error(`Test error logger`);
    } catch (error) {
        req.logger.error(`Peticion GET error ${error.message}`);
        return res.status(500).json({ ok: false, error: error.message });
    }
};

// WARNING
const loggerWarningCtrl = async (req, res) => {
    try {
        req.logger.warn("Petición GET warning");
        res.send("Test warning logger");
    } catch (error) {
        req.logger.error(`Peticion con error ${error.message}`);
    }
};

// Info
const loggerInfoCtrl = async (req, res) => {
    try {
        req.logger.info("Petición GET info");
        res.send("Test info logger");
    } catch (error) {
        req.logger.error(`Peticion con error ${error.message}`);
    }
};

// HTTP
const loggerHttpCtrl = async (req, res) => {
    try {
        req.logger.http("Petición GET http");
        res.send("Test http logger");
    } catch (error) {
        req.logger.error(`Peticion con error ${error.message}`);
    }
};

// DEBUG
const loggerDebugCtrl = async (req, res) => {
    try {
        req.logger.debug("Petición GET debug");
        res.send("Test debug logger");
    } catch (error) {
        req.logger.error(`Peticion con error ${error.message}`);
    }
};

export {
    loggerErrorCtrl,
    loggerWarningCtrl,
    loggerInfoCtrl,
    loggerHttpCtrl,
    loggerDebugCtrl
};