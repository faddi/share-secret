import { pki } from "node-forge";

interface IResult<T> {
  isError: false;
  result: T;
}
interface IError<TypeString, ErrorType = unknown> {
  isError: true;
  type: TypeString;
  error?: ErrorType;
}

async function generatePair() {
  return new Promise<
    IResult<pki.rsa.KeyPair> | IError<"failed-to-gen-key", Error>
  >((resolve) => {
    pki.rsa.generateKeyPair({ bits: 2048, workers: -1 }, function (
      err,
      keypair
    ) {
      if (err) {
        resolve({ isError: true, type: "failed-to-gen-key", error: err });
        return;
      }

      resolve({ isError: false, result: keypair });
    });
  });
}

function f(q: string) {
  const e = document.querySelector(q);

  if (e === null) {
    throw Error(`Could not find ${q}`);
  }

  return e;
}

function getElements() {
  return {
    sendSection: f("#send-secret"),
    receiveSection: f("#receive-secret"),
    showSendSectionButton: f("#show-send-section-button"),
    showReceiveSectionButton: f("#show-receive-section-button"),
    generateKeysButton: f("#generate-keys-button"),
    publicKeyArea: f("#public-key"),
    privateKeyArea: f("#private-key"),
  };
}

document.addEventListener("DOMContentLoaded", function (event) {
  console.log("loaded");

  const elems = getElements();

  elems.showReceiveSectionButton.addEventListener("click", () => {
    elems.receiveSection.classList.remove("hidden");
    elems.sendSection.classList.add("hidden");
  });

  elems.showSendSectionButton.addEventListener("click", () => {
    elems.receiveSection.classList.add("hidden");
    elems.sendSection.classList.remove("hidden");
  });

  elems.generateKeysButton.addEventListener("click", async () => {
    const res = await generatePair();

    if (res.isError) {
      console.error(res);
      return;
    }

    const keyPair = res.result;

    (elems.publicKeyArea as HTMLTextAreaElement).value = pki.publicKeyToPem(
      keyPair.publicKey
    );

    (elems.privateKeyArea as HTMLTextAreaElement).value = pki.privateKeyToPem(
      keyPair.privateKey
    );

    // const encrypted = keyPair.publicKey.encrypt("hello");

    // console.log(encrypted);

    // const out = keyPair.privateKey.decrypt(encrypted);

    // console.log("other side: ", out);

    // const key = pki.publicKeyToPem(keyPair.publicKey);

    // console.log(key);

    // console.log(keyPair);
  });
});
