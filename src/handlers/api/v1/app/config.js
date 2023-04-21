const config = require('config')

const { handler } = require('../../../../services/http')

/**
 * @swagger
 * /v1/app/config:
 *   get:
 *     summary: Get account config
 *     description: Returns logged in acocunt configuration.
 *     tags:
 *       - app
 *     security:
 *       - JwtAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/HeaderContentLanguage'
 *       - $ref: '#/components/parameters/HeaderXOrgId'
 *     responses:
 *       200:
 *         description: Ok
 *         headers:
 *           Access-Control-Allow-Origin:
 *             $ref: '#/components/headers/Access-Control-Allow-Origin'
 *           Access-Control-Allow-Headers:
 *             $ref: '#/components/headers/Access-Control-Allow-Headers'
 *           Access-Control-Allow-Methods:
 *             $ref: '#/components/headers/Access-Control-Allow-Methods'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - data
 *               properties:
 *                 data:
 *                   type: object
 *                   required:
 *                     - google
 *                     - payments
 *                   properties:
 *                     google:
 *                       type: object
 *                       properties:
 *                         oauth:
 *                           type: object
 *                           properties:
 *                             clientId:
 *                               type: string
 *                         maps:
 *                           type: object
 *                           properties:
 *                             apiKey:
 *                               type: string
 *                     payments:
 *                       type: object
 *                       properties:
 *                         apiVersion:
 *                           type: string
 *                         stripePublicKey:
 *                           type: string
 *                         defaultCurrency:
 *                           type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
module.exports = handler((req, res) => (
  res.json({
    data: {
      version: process.env.npm_package_version,
      google: {
        oauth: {
          clientId: config.get('google.oauth.clientId'),
        },
        maps: {
          apiKey: config.get('google.maps.apiKey'),
        },
      },
      payments: {
        apiVersion: config.get('payments.stripe.version'),
        stripePublicKey: config.get('payments.stripe.apiPublicKey'),
        defaultCurrency: config.get('payments.defaultCurrency'),
      },
    },
  })
))
