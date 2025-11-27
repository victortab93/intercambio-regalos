export function inviteJoinedTemplate({
    userName,
    exchangeName,
  }: {
    userName: string;
    exchangeName: string;
  }) {
    return `
    <div style="font-family:Arial; padding:20px; color:#333;">
      <h2 style="color:#0f62fe;">🎉 Nuevo participante</h2>
  
      <p><strong>${userName}</strong> se ha unido al intercambio <strong>${exchangeName}</strong>.</p>
  
      <p>Ya puede agregar su wishlist y esperar el emparejamiento.</p>
  
      <hr style="margin:20px 0;" />
  
      <p style="font-size:12px; color:#777;">
        Este es un correo automático, por favor no responder.
      </p>
    </div>
    `;
  }
  