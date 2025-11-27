import { sendEmail } from "./sendMail";
import { pairingCreatedTemplate } from "./templates/pairingCreated";
import { pairingDeletedTemplate } from "./templates/pairingDeleted";
import { inviteJoinedTemplate } from "./templates/inviteJoined";

export function sendPairingCreatedEmail({
  email,
  giverName,
  receiverName,
  exchangeName,
}: {
  email: string;
  giverName: string;
  receiverName: string;
  exchangeName: string;
}) {
  return sendEmail({
    to: email,
    subject: `Tu pareja del intercambio ${exchangeName}`,
    html: pairingCreatedTemplate({ giverName, receiverName, exchangeName }),
  });
}

export function sendPairingDeletedEmail({
  email,
  giverName,
  exchangeName,
}: {
  email: string;
  giverName: string;
  exchangeName: string;
}) {
  return sendEmail({
    to: email,
    subject: `Emparejamiento eliminado (${exchangeName})`,
    html: pairingDeletedTemplate({ giverName, exchangeName }),
  });
}

export function sendInviteJoinedEmail({
  email,
  userName,
  exchangeName,
}: {
  email: string;
  userName: string;
  exchangeName: string;
}) {
  return sendEmail({
    to: email,
    subject: `Nuevo participante en ${exchangeName}`,
    html: inviteJoinedTemplate({ userName, exchangeName }),
  });
}
