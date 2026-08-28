const https = require("https");
const crypto = require("crypto");

// =====================================================
// FLUTTERWAVE V4 CONFIGURATION
// =====================================================

const FLUTTERWAVE_BASE_URL =
  "https://f4bexperience.flutterwave.com";

const FLUTTERWAVE_TOKEN_URL =
  "https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token";

// =====================================================
// ACCESS TOKEN CACHE
// =====================================================

let accessToken = null;
let accessTokenExpiresAt = 0;

// =====================================================
// GENERATE UNIQUE ID
// =====================================================

const generateId = () => {
  return crypto.randomUUID();
};

// =====================================================
// GET FLUTTERWAVE ACCESS TOKEN
// =====================================================

const getFlutterwaveAccessToken = () => {
  return new Promise((resolve, reject) => {
    const clientId =
      process.env.FLW_CLIENT_ID;

    const clientSecret =
      process.env.FLW_CLIENT_SECRET;

    if (!clientId) {
      return reject(
        new Error(
          "FLW_CLIENT_ID is not configured in .env"
        )
      );
    }

    if (!clientSecret) {
      return reject(
        new Error(
          "FLW_CLIENT_SECRET is not configured in .env"
        )
      );
    }

    // Reuse existing token while valid
    if (
      accessToken &&
      Date.now() <
        accessTokenExpiresAt - 60 * 1000
    ) {
      return resolve(accessToken);
    }

    const tokenData =
      new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type:
          "client_credentials",
      }).toString();

    const url =
      new URL(
        FLUTTERWAVE_TOKEN_URL
      );

    const options = {
      hostname:
        url.hostname,

      path:
        url.pathname,

      method: "POST",

      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",

        "Content-Length":
          Buffer.byteLength(tokenData),
      },
    };

    const request =
      https.request(
        options,
        (response) => {
          let data = "";

          response.on(
            "data",
            (chunk) => {
              data += chunk;
            }
          );

          response.on(
            "end",
            () => {
              let result;

              try {
                result =
                  JSON.parse(data);
              } catch (error) {
                return reject(
                  new Error(
                    "Invalid response from Flutterwave authentication server."
                  )
                );
              }

              if (
                response.statusCode < 200 ||
                response.statusCode >= 300
              ) {
                console.error(
                  "Flutterwave OAuth error:",
                  result
                );

                return reject(
                  new Error(
                    result.error_description ||
                      result.message ||
                      "Unable to obtain Flutterwave access token."
                  )
                );
              }

              if (
                !result.access_token
              ) {
                return reject(
                  new Error(
                    "Flutterwave did not return an access token."
                  )
                );
              }

              accessToken =
                result.access_token;

              const expiresIn =
                Number(
                  result.expires_in || 600
                );

              accessTokenExpiresAt =
                Date.now() +
                expiresIn * 1000;

              console.log(
                "Flutterwave access token obtained successfully."
              );

              resolve(
                accessToken
              );
            }
          );
        }
      );

    request.on(
      "error",
      (error) => {
        reject(error);
      }
    );

    request.write(
      tokenData
    );

    request.end();
  });
};

// =====================================================
// FLUTTERWAVE API REQUEST
// =====================================================

const flutterwaveRequest = async (
  method,
  path,
  body = null,
  extraHeaders = {}
) => {
  const token =
    await getFlutterwaveAccessToken();

  return new Promise(
    (resolve, reject) => {
      const requestData =
        body
          ? JSON.stringify(body)
          : null;

      const url =
        new URL(
          `${FLUTTERWAVE_BASE_URL}${path}`
        );

      const headers = {
        Authorization:
          `Bearer ${token}`,

        Accept:
          "application/json",

        "Content-Type":
          "application/json",

        "X-Trace-Id":
          generateId(),

        ...extraHeaders,
      };

      if (requestData) {
        headers[
          "Content-Length"
        ] =
          Buffer.byteLength(
            requestData
          );
      }

      const options = {
        hostname:
          url.hostname,

        path:
          `${url.pathname}${url.search}`,

        method,

        headers,
      };

      const request =
        https.request(
          options,
          (response) => {
            let data = "";

            response.on(
              "data",
              (chunk) => {
                data += chunk;
              }
            );

            response.on(
              "end",
              () => {
                let result;

                try {
                  result =
                    data
                      ? JSON.parse(data)
                      : {};
                } catch (error) {
                  return reject(
                    new Error(
                      "Invalid response from Flutterwave."
                    )
                  );
                }

                resolve({
                  statusCode:
                    response.statusCode,

                  data: result,
                });
              }
            );
          }
        );

      request.on(
        "error",
        (error) => {
          reject(error);
        }
      );

      if (requestData) {
        request.write(
          requestData
        );
      }

      request.end();
    }
  );
};

// =====================================================
// CREATE MOBILE MONEY PAYMENT
// USING FLUTTERWAVE ORCHESTRATOR
// =====================================================

const createMobileMoneyPayment =
  async (
    req,
    res
  ) => {
    try {
      const {
        amount,
        phoneNumber,
        network,
        email,
        name,
        trackingNumber,
      } = req.body;

      // =================================================
      // VALIDATION
      // =================================================

      if (
        amount === undefined ||
        amount === null ||
        Number(amount) < 100
      ) {
        return res.status(400).json({
          message:
            "Payment amount must be at least 100 XAF.",
        });
      }

      if (!phoneNumber) {
        return res.status(400).json({
          message:
            "Mobile Money phone number is required.",
        });
      }

      if (!network) {
        return res.status(400).json({
          message:
            "Mobile Money network is required.",
        });
      }

      if (!email) {
        return res.status(400).json({
          message:
            "Customer email is required.",
        });
      }

      // =================================================
      // NETWORK
      // =================================================

      const normalizedNetwork =
        String(network)
          .trim()
          .toLowerCase();

      let flutterwaveNetwork;

      if (
        normalizedNetwork ===
        "mtn"
      ) {
        flutterwaveNetwork =
          "MTN";
      } else if (
        normalizedNetwork ===
        "orange"
      ) {
        flutterwaveNetwork =
          "ORANGEMONEY";
      } else {
        return res.status(400).json({
          message:
            "Unsupported Mobile Money network. Use MTN or Orange.",
        });
      }

      // =================================================
      // PHONE NUMBER
      // =================================================

      let formattedPhone =
        String(phoneNumber)
          .replace(/\s+/g, "")
          .replace(/^\+/, "");

      if (
        formattedPhone.startsWith(
          "237"
        )
      ) {
        // Already formatted
      } else if (
        formattedPhone.startsWith(
          "6"
        ) &&
        formattedPhone.length === 9
      ) {
        formattedPhone =
          `237${formattedPhone}`;
      } else {
        return res.status(400).json({
          message:
            "Please enter a valid Cameroon Mobile Money number.",
        });
      }

      // =================================================
      // CUSTOMER NAME
      // =================================================

      const customerName =
        (
          name?.trim() ||
          "FindParcel Customer"
        )
          .split(/\s+/)
          .filter(Boolean);

      const firstName =
        customerName[0] ||
        "FindParcel";

      const lastName =
        customerName
          .slice(1)
          .join(" ") ||
        "Customer";

      // =================================================
      // TRANSACTION REFERENCE
      // =================================================

      const reference =
        `FP-${Date.now()}-${Math.floor(
          Math.random() * 100000
        )}`;

      // =================================================
      // ORCHESTRATOR PAYMENT DATA
      // =================================================

      const paymentData = {
        amount:
          Number(amount),

        currency:
          "XAF",

        reference,

        redirect_url:
          process.env.FRONTEND_URL ||
          "http://localhost:3000/payment-methods",

        customer: {
          email:
            email.trim(),

          phone: {
            country_code:
              "237",

            number:
              formattedPhone.replace(
                /^237/,
                ""
              ),
          },

          name: {
            first:
              firstName,

            last:
              lastName,
          },

          meta: {
            application:
              "FindParcel",

            trackingNumber:
              trackingNumber || "",
          },
        },

        payment_method: {
          type:
            "mobile_money",

          mobile_money: {
            country_code:
              "237",

            network:
              flutterwaveNetwork,

            phone_number:
              formattedPhone.replace(
                /^237/,
                ""
              ),
          },
        },

        meta: {
          trackingNumber:
            trackingNumber || "",

          findparcelNetwork:
            normalizedNetwork,

          application:
            "FindParcel",
        },
      };

      console.log(
        "Creating Flutterwave Mobile Money charge..."
      );

      // =================================================
      // CREATE CHARGE
      // =================================================

      const response =
        await flutterwaveRequest(
          "POST",
          "/orchestration/direct-charges",
          paymentData,
          {
            "X-Idempotency-Key":
              generateId(),
          }
        );

      console.log(
        "Flutterwave charge response:",
        response.data
      );

      // =================================================
      // FLUTTERWAVE ERROR
      // =================================================

      if (
        response.statusCode < 200 ||
        response.statusCode >= 300
      ) {
        return res.status(400).json({
          message:
            response.data?.error
              ?.message ||
            response.data?.message ||
            "Flutterwave payment could not be created.",

          code:
            response.data?.error
              ?.code ||
            null,

          flutterwave:
            response.data,
        });
      }

      // =================================================
      // CHARGE DATA
      // =================================================

      const charge =
        response.data?.data;

      if (!charge) {
        return res.status(400).json({
          message:
            "Flutterwave returned an empty charge response.",

          flutterwave:
            response.data,
        });
      }

      // =================================================
      // RETURN TO FRONTEND
      // =================================================

      return res.status(200).json({
        message:
          "Mobile Money payment request created successfully.",

        transactionReference:
          reference,

        transactionId:
          charge.id ||
          null,

        status:
          charge.status ||
          "pending",

        nextAction:
          charge.next_action ||
          null,

        redirectUrl:
          charge.next_action
            ?.redirect_url
            ?.url ||
          charge.redirect_url ||
          null,

        data:
          charge,
      });
    } catch (error) {
      console.error(
        "Create mobile money payment error:",
        error
      );

      return res.status(500).json({
        message:
          error.message ||
          "Server error while creating payment.",
      });
    }
  };

// =====================================================
// VERIFY MOBILE MONEY PAYMENT
// =====================================================

const verifyMobileMoneyPayment =
  async (
    req,
    res
  ) => {
    try {
      const {
        transactionId,
        expectedAmount,
        transactionReference,
      } = req.body;

      // =================================================
      // VALIDATION
      // =================================================

      if (!transactionId) {
        return res.status(400).json({
          message:
            "Flutterwave charge ID is required.",
        });
      }

      if (
        expectedAmount ===
          undefined ||
        expectedAmount ===
          null
      ) {
        return res.status(400).json({
          message:
            "Expected payment amount is required.",
        });
      }

      // =================================================
      // RETRIEVE CHARGE
      // =================================================

      const response =
        await flutterwaveRequest(
          "GET",
          `/charges/${encodeURIComponent(
            transactionId
          )}`
        );

      console.log(
        "Flutterwave charge verification:",
        response.data
      );

      if (
        response.statusCode < 200 ||
        response.statusCode >= 300
      ) {
        return res.status(400).json({
          message:
            response.data?.error
              ?.message ||
            response.data?.message ||
            "Transaction verification failed.",

          flutterwave:
            response.data,
        });
      }

      const transaction =
        response.data?.data;

      if (!transaction) {
        return res.status(400).json({
          message:
            "Flutterwave did not return transaction details.",
        });
      }

      // =================================================
      // CHECK STATUS
      // =================================================

      const isSuccessful =
        transaction.status ===
        "succeeded";

      // =================================================
      // CHECK AMOUNT
      // =================================================

      const amountMatches =
        Number(
          transaction.amount
        ) ===
        Number(
          expectedAmount
        );

      // =================================================
      // CHECK CURRENCY
      // =================================================

      const currencyMatches =
        transaction.currency ===
        "XAF";

      // =================================================
      // CHECK REFERENCE
      // =================================================

      const referenceMatches =
        !transactionReference ||
        transaction.reference ===
          transactionReference;

      // =================================================
      // FAILED VERIFICATION
      // =================================================

      if (
        !isSuccessful ||
        !amountMatches ||
        !currencyMatches ||
        !referenceMatches
      ) {
        return res.status(400).json({
          message:
            "Payment has not been successfully verified.",

          paymentSuccessful:
            false,

          paymentStatus:
            transaction.status ||
            "unknown",

          amountMatches,

          currencyMatches,

          referenceMatches,

          transaction,
        });
      }

      // =================================================
      // SUCCESS
      // =================================================

      return res.status(200).json({
        message:
          "Payment verified successfully.",

        paymentSuccessful:
          true,

        transaction: {
          id:
            transaction.id,

          reference:
            transaction.reference,

          amount:
            transaction.amount,

          currency:
            transaction.currency,

          status:
            transaction.status,

          customer:
            transaction.customer ||
            null,

          paymentMethod:
            transaction.payment_method_details ||
            null,

          processorResponse:
            transaction.processor_response ||
            null,

          createdDatetime:
            transaction.created_datetime ||
            null,
        },
      });
    } catch (error) {
      console.error(
        "Verify mobile money payment error:",
        error
      );

      return res.status(500).json({
        message:
          error.message ||
          "Server error while verifying payment.",
      });
    }
  };

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createMobileMoneyPayment,
  verifyMobileMoneyPayment,
};