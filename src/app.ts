import { pki, util } from "node-forge";

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
    receivePublicKeyArea: f("#receive-public-key") as HTMLTextAreaElement,
    receivePrivateKeyArea: f("#receive-private-key") as HTMLTextAreaElement,
    encryptMessageButton: f("#encrypt-message-button"),
    sendPublicKeyArea: f("#send-public-key") as HTMLTextAreaElement,
    secretMessageArea: f("#secret-message-area") as HTMLTextAreaElement,
    sendEncryptedMessageArea: f(
      "#send-encrypted-message-area"
    ) as HTMLTextAreaElement,
    receiveEncryptedMessageArea: f(
      "#receive-encrypted-message-area"
    ) as HTMLTextAreaElement,
    decryptedMessageArea: f("#decrypted-message-area") as HTMLTextAreaElement,
    decryptMessageButton: f("#decrypt-message-button"),
  };
}

function showError(err: Error | string) {
  console.error(err);
  alert(err);
}

// function safe<T = (args: ...any[]) => any, E>(
//   fn: T,
//   errType?: E
// ): IError<E, Error> | IResult<ReturnType<T>> {
//   try {
//     return { isError: false, result: fn() };
//   } catch (e) {
//     return { isError: true, type: errType, error: e };
//   }
// }

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

  elems.decryptMessageButton.addEventListener("click", () => {
    const encryptedMessageB64 = elems.receiveEncryptedMessageArea.value;

    const encryptedMessage = util.decode64(encryptedMessageB64);

    const privateKey = pki.privateKeyFromPem(elems.receivePrivateKeyArea.value);

    const decryptedMessageBytes = privateKey.decrypt(encryptedMessage);

    const decryptedMessage = util.decodeUtf8(decryptedMessageBytes);

    elems.decryptedMessageArea.value = decryptedMessage;
  });

  elems.encryptMessageButton.addEventListener("click", () => {
    const text = elems.sendPublicKeyArea.value;
    const message = elems.secretMessageArea.value;

    const publicKey = pki.publicKeyFromPem(text);

    const messageBytes = util.encodeUtf8(message);

    const encryptedMessage = publicKey.encrypt(messageBytes);

    const encryptedMessageB64 = util.encode64(encryptedMessage);

    elems.sendEncryptedMessageArea.value = encryptedMessageB64;
  });

  elems.generateKeysButton.addEventListener("click", async () => {
    const res = await generatePair();

    if (res.isError) {
      console.error(res);
      return;
    }

    const keyPair = res.result;

    elems.receivePublicKeyArea.value = pki.publicKeyToPem(keyPair.publicKey);
    elems.receivePrivateKeyArea.value = pki.privateKeyToPem(keyPair.privateKey);
  });
});
