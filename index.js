let paymentsClient = null;

function initGooglePay() {
  const gatewayMerchantId = document.getElementById("gatewayKey").value;
  const merchantId = document.getElementById("merchantId").value;
  const environment = document.getElementById("env").value;

  const tokenizationSpecification = {
    type: 'PAYMENT_GATEWAY',
    parameters: {
      gateway: 'omise',
      gatewayMerchantId: gatewayMerchantId,
    }
  };

  const baseCardPaymentMethod = {
    type: 'CARD',
    parameters: {
      allowedAuthMethods: ["PAN_ONLY"],
      allowedCardNetworks: ["AMEX", "JCB", "MASTERCARD", "VISA"],
      billingAddressRequired: true,
      billingAddressParameters: {
        format: "FULL",
        phoneNumberRequired: true
      }
    },
    tokenizationSpecification: tokenizationSpecification
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
      totalPrice: '35.00'
    },
    merchantInfo: {
      merchantId: merchantId,
      merchantName: 'Test Merchant'
    }
  };

  paymentsClient = new google.payments.api.PaymentsClient({ environment });
  paymentsClient.isReadyToPay(baseRequest)
    .then(response => {
      if (response.result) {
        const button = paymentsClient.createButton({
          onClick: () => {
            paymentsClient.loadPaymentData(paymentDataRequest)
              .then(paymentData => {
                document.getElementById("result").innerText =
                  JSON.stringify(JSON.parse(paymentData.paymentMethodData.tokenizationData.token), null, 2);
              })
              .catch(err => {
                console.error(err);
                alert(JSON.stringify(err));
              });
          }
        });
        document.getElementById("container").innerHTML = ""; // clear previous
        document.getElementById("container").appendChild(button);
      } else {
        alert("Google Pay not available.");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Error initializing Google Pay: " + err);
    });
}
