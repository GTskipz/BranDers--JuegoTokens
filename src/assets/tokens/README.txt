TOKEN SPIN LOOP ASSETS

Sprite vertical transparente de 62 frames.
Cada frame: 256 x 256 px.
Sprite total: 256 x 15872 px.
Secuencia: frames 0-31 y regreso 30-1 para cerrar el ciclo sin salto.

CSS recomendado:

.falling-token__sprite {
  background-repeat: no-repeat;
  background-size: 100% 6200%;
  background-position: center top;
  animation: token-sprite-spin var(--spin-duration) steps(61, end) infinite;
}

@keyframes token-sprite-spin {
  from { background-position: center top; }
  to { background-position: center bottom; }
}

Nota: es un ciclo de ida y vuelta, creado para evitar el salto entre el ultimo y el primer frame.
