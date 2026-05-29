const { pool } = require('../config/db');

const USER_COLUMNS = [
  'id',
  'nombre',
  'nombres',
  'apellidos',
  'correo',
  'email',
  'password',
  'password_hash',
  'contrasena',
  'contraseña',
  'activo',
  'estado',
  'rol_id'
];

const ROLE_COLUMNS = ['id', 'nombre', 'rol', 'nombre_rol', 'descripcion'];

async function getColumns(tableName) {
  const [rows] = await pool.query(`SHOW COLUMNS FROM \`${tableName}\``);
  return rows.map((row) => row.Field);
}

function pickColumn(columns, candidates) {
  return candidates.find((candidate) => columns.includes(candidate));
}

function buildSelect(tableAlias, columns, wantedColumns) {
  return wantedColumns
    .filter((column) => columns.includes(column))
    .map((column) => `${tableAlias}.\`${column}\` AS \`${tableAlias}_${column}\``);
}

function normalizeUser(row, userColumns, roleColumns) {
  const nameColumn = pickColumn(userColumns, ['nombre', 'nombres']);
  const lastNameColumn = pickColumn(userColumns, ['apellidos']);
  const emailColumn = pickColumn(userColumns, ['correo', 'email']);
  const passwordColumn = pickColumn(userColumns, ['password_hash', 'password', 'contrasena', 'contraseña']);
  const statusColumn = pickColumn(userColumns, ['activo', 'estado']);
  const roleNameColumn = pickColumn(roleColumns, ['nombre', 'rol', 'nombre_rol', 'descripcion']);

  const nombres = nameColumn ? row[`u_${nameColumn}`] : '';
  const apellidos = lastNameColumn ? row[`u_${lastNameColumn}`] : '';
  const nombreCompleto = [nombres, apellidos].filter(Boolean).join(' ').trim();

  return {
    id: row.u_id,
    nombre: nombreCompleto || nombres || 'Usuario',
    correo: emailColumn ? row[`u_${emailColumn}`] : null,
    passwordHash: passwordColumn ? row[`u_${passwordColumn}`] : null,
    activo: statusColumn ? row[`u_${statusColumn}`] : 1,
    rolId: row.u_rol_id,
    rol: roleNameColumn ? row[`r_${roleNameColumn}`] : null
  };
}

function isActive(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'number') return value === 1;

  const normalized = String(value).trim().toUpperCase();
  return ['1', 'ACTIVO', 'ACTIVE', 'TRUE', 'SI', 'SÍ'].includes(normalized);
}

async function findByEmail(correo) {
  const [userColumns, roleColumns] = await Promise.all([
    getColumns('usuarios'),
    getColumns('roles')
  ]);

  const emailColumn = pickColumn(userColumns, ['correo', 'email']);
  if (!emailColumn) {
    throw new Error('La tabla usuarios debe tener una columna correo o email');
  }

  const selectedColumns = [
    ...buildSelect('u', userColumns, USER_COLUMNS),
    ...buildSelect('r', roleColumns, ROLE_COLUMNS)
  ];

  const [rows] = await pool.execute(
    `SELECT ${selectedColumns.join(', ')}
     FROM usuarios u
     INNER JOIN roles r ON r.id = u.rol_id
     WHERE u.\`${emailColumn}\` = ?
     LIMIT 1`,
    [correo]
  );

  if (!rows.length) return null;
  return normalizeUser(rows[0], userColumns, roleColumns);
}

module.exports = {
  findByEmail,
  isActive
};
