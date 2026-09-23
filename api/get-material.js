import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { telegram_id, stage, subject, device_id } = req.query;

  if (!telegram_id || !stage || !subject || !device_id) {
    return res.status(400).json({ error: 'بيانات غير كافية للطلب' });
  }

  try {
    let { data: customers, error: custError } = await supabase
      .from('customers')
      .select('*')
      .eq('telegram_id', telegram_id);

    if (custError) throw custError;

    const deviceExists = customers.some(c => c.device_fingerprint === device_id);

    if (!deviceExists) {
      const uniqueDevices = new Set(customers.map(c => c.device_fingerprint));
      
      if (uniqueDevices.size >= 2) {
        return res.status(403).json({ 
          error: 'عذراً، لقد تجاوزت الحد الأقصى لعدد الأجهزة المسموحة (جهازين كحد أقصى).' 
        });
      }

      await supabase.from('customers').insert([
        { telegram_id: telegram_id, device_fingerprint: device_id }
      ]);
    }

    let { data: material, error: matError } = await supabase
      .from('materials')
      .select('url')
      .eq('stage', stage)
      .eq('subject', subject)
      .single();

    if (matError || !material) {
      return res.status(404).json({ error: 'المادة المطلوبة غير موجودة' });
    }

    let standardUrl = material.url;
    let txtExportUrl = standardUrl;

    if (standardUrl.includes('docs.google.com/document/d/')) {
      const cleanUrl = standardUrl.split('/edit')[0].split('/view')[0];
      txtExportUrl = `${cleanUrl}/export?format=txt`;
    }

    return res.redirect(302, txtExportUrl);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
}
