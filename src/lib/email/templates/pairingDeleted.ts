export function pairingDeletedTemplate({
    giverName,
    exchangeName,
  }: {
    giverName: string;
    exchangeName: string;
  }) {
    return `
    <div style="font-family:Arial; padding:20px; color:#333;">
      <h2 style="color:#e6007a;">❌ Emparejamiento eliminado</h2>
  
      <p>Hola <strong>${giverName}</strong>,</p>
  
      <p>El emparejamiento del intercambio <strong>${exchangeName}</strong> ha sido eliminado.</p>
  
      <p>Cuando el organizador genere uno nuevo, recibirás otro correo.</p>
  
      <hr style="margin:20px 0;" />
  
      <p style="font-size:12px; color:#777;">
        Este es un correo automático, por favor no responder.
      </p>
    </div>
    `;
  }
  