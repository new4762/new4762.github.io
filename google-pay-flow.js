let paymentsClient = null;

function initGooglePay() {
  if (!window.google || !google.payments || !google.payments.api) {
    alert("Google Pay script is not ready yet. Please try again.");
    return;
  }

  const gatewayMerchantId = document.getElementById("gatewayKey").value.trim();
  const merchantId = document.getElementById("merchantId").value.trim();
  const environment = document.getElementById("env").value;

  if (!gatewayMerchantId || !merchantId) {
    alert("Please fill in both Omise Public Key and Merchant ID.");
    return;
  }

  const tokenizationSpecification = {
    type: "PAYMENT_GATEWAY",
    parameters: {
      gateway: "omise",
      gatewayMerchantId
    }
  };

  const baseCardPaymentMethod = {
    type: "CARD",
    parameters: {
      allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
      allowedCardNetworks: ["AMEX", "JCB", "MASTERCARD", "VISA"],
      billingAddressRequired: true,
      billingAddressParameters: {
        format: "FULL",
        phoneNumberRequired: true
      }
    },
    tokenizationSpecification
  };

  const baseRequest = {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [baseCardPaymentMethod]
  };

  const paymentDataRequest = {
    ...baseRequest,
    transactionInfo: {
      currencyCode: "THB",
      totalPriceStatus: "FINAL",
      totalPrice: "35.00"
    },
    merchantInfo: {
      merchantId,
      merchantName: "Merchant"
    }
  };

  paymentsClient = new google.payments.api.PaymentsClient({ environment });

  paymentsClient.isReadyToPay(baseRequest)
    .then((response) => {
      if (response.result) {
        const button = paymentsClient.createButton({
          onClick: () => {
            paymentsClient.loadPaymentData(paymentDataRequest)
              .then((paymentData) => handleGooglePaySuccess(paymentData))
              .catch((error) => {
                console.error(error);
                alert("Payment failed: " + JSON.stringify(error));
              });
          }
        });

        const container = document.getElementById("googleContainer");
        container.innerHTML = "";
        container.appendChild(button);
      } else {
        alert("Google Pay is not available.");
      }
    })
    .catch((error) => {
      console.error(error);
      alert("Error initializing Google Pay: " + error);
    });
}

function handleGooglePaySuccess(paymentData) {
  const tokenStr = paymentData.paymentMethodData.tokenizationData.token;
  window.TestConsoleState.latestGoogleToken = tokenStr;

  let formatted = tokenStr;
  try {
    const parsed = JSON.parse(tokenStr);
    formatted = JSON.stringify(parsed, null, 2);
  } catch (error) {
    console.warn("Google Pay token is not JSON. Using raw token.", error);
  }

  const outputElem = document.getElementById("googlePayloadOutput");
  outputElem.textContent = formatted;

  const copyBtn = document.getElementById("copyGooglePayloadBtn");
  copyBtn.style.display = "inline-block";

  const useTokenBtn = document.getElementById("useTokenInCustomBtn");
  useTokenBtn.style.display = "inline-block";
}
