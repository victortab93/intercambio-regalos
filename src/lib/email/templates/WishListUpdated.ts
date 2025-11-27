// src/lib/email/templates/wishlistUpdated.ts

interface WishlistUpdatedParams {
    giverName: string;
    receiverName: string;
    wishlist: string[];
    exchangeName: string;
  }
  
  export function wishlistUpdatedTemplate(params: WishlistUpdatedParams) {
    const { giverName, receiverName, wishlist, exchangeName } = params;
  
    const itemsHtml = wishlist
      .map((item) => `<li style="margin-bottom:6px;">🎁 ${item}</li>`)
      .join("");
  
    return `
    <div style="font-family: Arial, sans-serif; padding:20px; line-height:1.6;">
      <h2 style="color:#d63384;">🎄 Wishlist actualizada</h2>
  
      <p>Hola <strong>${giverName}</strong>,</p>
  
      <p><strong>${receiverName}</strong> ha actualizado su lista de deseos para el intercambio <strong>${exchangeName}</strong>.</p>
  
      <p>Aquí tienes su nueva lista:</p>
  
      <ul style="padding-left:18px;">
        ${itemsHtml}
      </ul>
  
      <p>Puedes ver más detalles entrando al intercambio desde la app.</p>
  
      <br />
      <p style="color:#999; font-size:12px;">
        Este correo se generó automáticamente porque eres la pareja asignada de ${receiverName}.
      </p>
    </div>
    `;
  }
  