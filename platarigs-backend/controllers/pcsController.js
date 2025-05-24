const supabase = require('../supabaseClient');

// GET /api/pcs
async function getAllPcs(req, res) {
  const { data, error } = await supabase
    .from('pcs')
    .select('*');
  if (error) return res.status(500).json({ error });
  res.json(data);
}

// POST /api/pcs
async function addPc(req, res) {
  const { name, teile, gesamtpreis } = req.body;
  const { data, error } = await supabase
    .from('pcs')
    .insert([{ name, teile, gesamtpreis }]);
  if (error) return res.status(500).json({ error });
  res.status(201).json(data[0]);
}

// PUT /api/pcs/:id
async function updatePc(req, res) {
  const { id } = req.params;
  const updates = req.body;
  const { data, error } = await supabase
    .from('pcs')
    .update(updates)
    .eq('id', id);
  if (error) return res.status(500).json({ error });
  res.json(data[0]);
}

// DELETE /api/pcs/:id
async function deletePc(req, res) {
  const { id } = req.params;
  const { error } = await supabase
    .from('pcs')
    .delete()
    .eq('id', id);
  if (error) return res.status(500).json({ error });
  res.status(204).send();
}

module.exports = {
  getAllPcs,
  addPc,
  updatePc,
  deletePc
};
