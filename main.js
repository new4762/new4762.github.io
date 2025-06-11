let paymentsClient = null;

function initGooglePay() {
  const gatewayMerchantId = document.getElementById("gatewayKey").value.trim();
  const merchantId = document.getElementById("merchantId").value.trim();
  const environment = document.getElementById("env").value;
  const amount = document.getElementById("amount").value.trim();

  if (!gatewayMerchantId || !merchantId) {
    alert("Please fill in both Omise Public Key and Merchant ID.");
    return;
  }

  const tokenizationSpecification = {
    type: 'PAYMENT_GATEWAY',
    parameters: {
      gateway: 'omise',
      gatewayMerchantId
    }
  };

  const baseCardPaymentMethod = {
    type: 'CARD',
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
      currencyCode: 'THB',
      totalPriceStatus: 'FINAL',
      totalPrice: amount
    },
    merchantInfo: {
      merchantId,
      merchantName: 'Merchant'
    }
  };

  paymentsClient = new google.payments.api.PaymentsClient({ environment });

  paymentsClient.isReadyToPay(baseRequest)
    .then(response => {
      if (response.result) {
        const button = paymentsClient.createButton({
          onClick: () => {
            paymentsClient.loadPaymentData(paymentDataRequest)
              .then(paymentData => handlePaymentSuccess(paymentData))
              .catch(err => {
                console.error(err);
                alert("Payment failed: " + JSON.stringify(err));
              });
          }
        });
        const container = document.getElementById("container");
        container.innerHTML = "";
        container.appendChild(button);
      } else {
        alert("Google Pay is not available.");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Error initializing Google Pay: " + err);
    });
}

function handlePaymentSuccess(paymentData) {
  const tokenStr = paymentData.paymentMethodData.tokenizationData.token;
  let payload;

  try {
    payload = JSON.stringify(JSON.parse(tokenStr));
  } catch (e) {
    payload = tokenStr; // fallback to raw token if parsing fails
  }

  const formatted = typeof payload === "string"
    ? payload
    : JSON.stringify(payload, null, 2);

  const outputElem = document.getElementById("payloadOutput");
  outputElem.textContent = formatted;

  const copyBtn = document.getElementById("copyPayloadBtn");
  copyBtn.style.display = "inline-block";
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(formatted)
      // .then(() => alert("Copied to clipboard!"))
      .catch(err => alert("Copy failed: " + err));
  };
}
