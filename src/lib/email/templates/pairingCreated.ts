export function pairingCreatedTemplate({
    giverName,
    receiverName,
    exchangeName,
  }: {
    giverName: string;
    receiverName: string;
    exchangeName: string;
  }) {
    return `
    <div style="font-family:Arial; padding:20px; color:#333;">
      <h2 style="color:#0f62fe;">🎁 Nuevo emparejamiento creado</h2>
  
      <p>Hola <strong>${giverName}</strong>,</p>
  
      <p>Ya tienes tu pareja asignada para el intercambio <strong>${exchangeName}</strong>.</p>
  
      <p>
        Te ha tocado regalar a:
        <br/>
        <span style="font-size:18px; font-weight:bold; color:#e6007a;">
          ${receiverName}
        </span>
      </p>
  
      <p>¡Suerte y que sea un gran regalo! 🎉</p>
  
      <hr style="margin:20px 0;" />
  
      <p style="font-size:12px; color:#777;">
        Este es un correo automático, por favor no responder.
      </p>
    </div>
    `;
  }
  