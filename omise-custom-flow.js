function createOmiseGooglePayTokenCustom() {
  if (!window.Omise) {
    alert("Omise.js is not loaded.");
    return;
  }

  const omisePublicKey = document.getElementById("omisePublicKey").value.trim();
  const tokenInput = document.getElementById("omiseGooglePayTokenInput").value.trim();

  if (!omisePublicKey || !tokenInput) {
    alert("Please fill in Omise Public Key and Google Pay token.");
    return;
  }

  let normalizedToken = tokenInput;
  try {
    normalizedToken = JSON.stringify(JSON.parse(tokenInput));
  } catch (error) {
    console.warn("Using raw Google Pay token text.", error);
  }

  const outputElem = document.getElementById("omiseResponseOutput");
  outputElem.textContent = "Creating token via Omise.createToken...";
  document.getElementById("copyOmiseResponseBtn").style.display = "none";

  Omise.setPublicKey(omisePublicKey);
  Omise.createToken("tokenization", {
    method: "googlepay",
    data: normalizedToken
  }, (statusCode, response) => {
    const success = statusCode >= 200 && statusCode < 300;
    const tokenId = response && response.id ? response.id : null;
    outputElem.textContent = JSON.stringify({
      mode: "custom",
      success,
      statusCode,
      tokenId,
      response
    }, null, 2);
    document.getElementById("copyOmiseResponseBtn").style.display = "inline-block";
  });
}

function sendGoogleTokenToOmiseCustom() {
  const token = window.TestConsoleState.latestGoogleToken;
  if (!token) {
    alert("Generate a Google Pay token first.");
    return;
  }

  document.getElementById("omiseGooglePayTokenInput").value = token;
  document.getElementById("omisePublicKey").value = document.getElementById("gatewayKey").value.trim();
  switchTab("omise");
  switchOmiseMode("custom");
}
