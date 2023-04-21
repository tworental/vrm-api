/**
 * @swagger
 * /v1/healthz:
 *   get:
 *     summary: Health status enpoint
 *     description: It checks a status of the application.
 *     security: []
 *     responses:
 *       200:
 *         description: Ok
 */
module.exports = (req, res) => res.status(200).end()
