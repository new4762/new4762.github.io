function openOmiseGooglePayPrebuilt() {
  if (!ensureOmiseSdkReady("OmiseCard")) {
    return;
  }

  const omisePublicKey = document.getElementById("omisePublicKey").value.trim();
  const googlepayMerchantId = document.getElementById("omiseGooglePayMerchantId").value.trim();
  const amountTHB = document.getElementById("omiseAmountTHB").value.trim();

  if (!omisePublicKey || !googlepayMerchantId || !amountTHB) {
    alert("Please fill in Omise Public Key, Google Pay Merchant ID, and Amount.");
    return;
  }

  const amountSatang = Math.round(Number(amountTHB) * 100);
  if (!Number.isFinite(amountSatang) || amountSatang <= 0) {
    alert("Amount must be a valid number greater than 0.");
    return;
  }

  const outputElem = document.getElementById("omiseResponseOutput");
  outputElem.textContent = "Opening Omise.js pre-built form...";
  document.getElementById("copyOmiseResponseBtn").style.display = "none";

  OmiseCard.configure({
    publicKey: omisePublicKey,
    currency: "thb",
    frameLabel: "Omise.js Google Pay Test"
  });

  try {
    OmiseCard.open({
      amount: amountSatang,
      currency: "thb",
      defaultPaymentMethod: "googlepay",
      googlepayMerchantId,
      onCreateTokenSuccess: (token) => {
        const tokenId = token && token.id ? token.id : token;
        outputElem.textContent = JSON.stringify({
          mode: "prebuilt",
          success: true,
          tokenId,
          token
        }, null, 2);
        document.getElementById("copyOmiseResponseBtn").style.display = "inline-block";
      },
      onFormClosed: () => {
        if (outputElem.textContent === "Opening Omise.js pre-built form...") {
          outputElem.textContent = "Omise form closed without token creation.";
        }
      }
    });
  } catch (error) {
    outputElem.textContent = JSON.stringify({
      mode: "prebuilt",
      success: false,
      error: String(error)
    }, null, 2);
    document.getElementById("copyOmiseResponseBtn").style.display = "inline-block";
  }
}
