
import fs from 'fs';

// Leer el archivo JSON original (que es la fuente de verdad)
const rawData = fs.readFileSync('./client/src/data/motor_database.json', 'utf8');
const db = JSON.parse(rawData);

// Función recursiva para añadir pcal: 0 donde falte
function addMissingPcal(obj) {
  for (const key in obj) {
    const motor = obj[key];
    // Si es un objeto de motor (tiene 'model' y 'dimensions')
    if (motor && typeof motor === 'object' && motor.model && motor.dimensions) {
      if (motor.pcal === undefined) {
        console.log(`Fixing missing pcal for: ${motor.model}`);
        motor.pcal = 0;
      }
    }
  }
}

addMissingPcal(db.fxm_motors);
addMissingPcal(db.fkm_motors);

// Generar el contenido del archivo TS
const tsContent = `import { MotorDatabase } from '../types/motor';

export const motorDatabase: MotorDatabase = ${JSON.stringify(db, null, 2)};
`;

// Escribir el archivo TS corregido
fs.writeFileSync('./client/src/data/motor_database.ts', tsContent);

console.log('Database fixed and converted to TS successfully!');
