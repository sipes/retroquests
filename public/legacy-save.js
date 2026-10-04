// Explicit boundary for baseline suite/garage snapshots. No chapter migration.
export function readLegacyPortalSave(envelope) {
 if(!envelope || envelope.data===null) return null;
 const d=envelope.data;
 if(envelope.version!==1 || !d || !['suite','garage'].includes(d.room) || !Array.isArray(d.inv) || d.inv.some(i=>!['crackers','keycard','ticket','keys','shoe','receipt'].includes(i)) || !d.flags || typeof d.flags!=='object' || Array.isArray(d.flags) || !d.scored || typeof d.scored!=='object' || !Number.isFinite(d.score) || !Number.isFinite(d.px) || !Number.isFinite(d.py)) throw new Error('Unsupported or corrupt portal save. Progress was not reset; use an explicit recovery choice.');
 return {...structuredClone(d),revealed:{},hintsUsed:0}; // Hint authority is the server, never the saved client copy.
}
