const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

async function subirImagen(req, res) {
  try {
    const { imagen } = req.body; // base64: data:image/jpeg;base64,...
    if (!imagen) return res.status(400).json({ success: false, message: 'Imagen requerida' });

    const matches = imagen.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) return res.status(400).json({ success: false, message: 'Formato de imagen no válido' });

    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const data = Buffer.from(matches[2], 'base64');
    const filename = `reporte_${Date.now()}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    fs.writeFileSync(filepath, data);
    const url = `/uploads/${filename}`;
    return res.json({ success: true, url });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error al subir imagen' });
  }
}

module.exports = { subirImagen };
