const supabase = require('../supabaseClient');

// GET /api/lager
async function getAllLager(req, res) {
  const { data, error } = await supabase
    .from('lager')
    .select('*');
  if (error) return res.status(500).json({ error });
  res.json(data);
}

// POST /api/lager
async function addLagerItem(req, res) {
  const { name, kategorie, anzahl, preis, lieferant } = req.body;
  const { data, error } = await supabase
    .from('lager')
    .insert([{ name, kategorie, anzahl, preis, lieferant }]);
  if (error) return res.status(500).json({ error });
  res.status(201).json(data[0]);
}

// PUT /api/lager/:id
async function updateLagerItem(req, res) {
  const { id } = req.params;
  const updates = req.body;
  const { data, error } = await supabase
    .from('lager')
    .update(updates)
    .eq('id', id);
  if (error) return res.status(500).json({ error });
  res.json(data[0]);
}

// DELETE /api/lager/:id
async function deleteLagerItem(req, res) {
  const { id } = req.params;
  const { error } = await supabase
    .from('lager')
    .delete()
    .eq('id', id);
  if (error) return res.status(500).json({ error });
  res.status(204).send();
}

module.exports = {
  getAllLager,
  addLagerItem,
  updateLagerItem,
  deleteLagerItem
};
