function parseDate(s) {
  var m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(s), y, mo, d;
  if (m) { d = parseInt(m[1], 10); mo = parseInt(m[2], 10); y = parseInt(m[3], 10); }
  else {
    m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (!m) { return null; }
    y = parseInt(m[1], 10); mo = parseInt(m[2], 10); d = parseInt(m[3], 10);
  }
  var dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) { return null; }
  return dt;
}

function validateForm() {
  var errs = {};
  var name = jQuery.trim(jQuery('#fullName').val());
  var nid = jQuery.trim(jQuery('#nationalId').val());
  var mobile = jQuery.trim(jQuery('#mobile').val());
  var email = jQuery.trim(jQuery('#email').val());
  var sd = parseDate(jQuery.trim(jQuery('#startDate').val()));
  var ed = parseDate(jQuery.trim(jQuery('#endDate').val()));

  if (name !== '' && !/^[\u0621-\u064A]+(\s+[\u0621-\u064A]+)*$/.test(name)) {
    errs.fullName = 'يجب أن يحتوي الاسم على أحرف عربية فقط';
  }
  if (nid === '') {
    errs.nationalId = 'الرقم الوطني إلزامي';
  } else if (!/^\d{11}$/.test(nid)) {
    errs.nationalId = 'يجب أن يتكون من 11 رقماً';
  } else {
    var p = parseInt(nid.substring(0, 2), 10);
    if (p < 1 || p > 14) { errs.nationalId = 'أول خانتين يجب أن تكونا بين 01 و 14'; }
  }
  if (sd === null) { errs.startDate = 'تاريخ البداية إلزامي وبصيغة dd-mm-yyyy صحيحة'; }
  if (ed === null) { errs.endDate = 'تاريخ النهاية إلزامي وبصيغة dd-mm-yyyy صحيحة'; }
  if (sd !== null && ed !== null && ed <= sd) { errs.endDate = 'يجب أن يكون تاريخ النهاية لاحقاً لتاريخ البداية'; }
  if (mobile !== '' && !/^09[345689]\d{7}$/.test(mobile)) {
    errs.mobile = 'رقم غير مطابق لشبكتي Syriatel (093/098/099) أو MTN (094/095/096)';
  }
  if (email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errs.email = 'بريد إلكتروني غير صحيح'; }
  return { errs: errs, start: sd, end: ed };
}

function showResult(days) {
  var total = 0, html = '<h3>نتيجة الحجز</h3><ul>';
  jQuery('input.selectBox:checked').each(function () {
    var row = jQuery(this).closest('tr');
    var price = parseInt(row.find('td.price').text(), 10);
    var model = jQuery.trim(row.find('td').eq(1).text());
    var sub = price * days;
    total += sub;
    html += '<li>' + model + ' - ' + days + ' يوم - ' + sub + ' ل.س</li>';
  });
  var discount = days > 7 ? total * 0.1 : 0;
  html += '</ul><p>عدد أيام التأجير: ' + days + '</p><p>المجموع: ' + total + ' ل.س</p>';
  html += '<p>الخصم (10% لمدة أكثر من 7 أيام): ' + discount + ' ل.س</p>';
  html += '<p><b>المبلغ النهائي: ' + (total - discount) + ' ل.س</b></p>';
  html += '<input type="button" id="closeBtn" value="إغلاق" />';
  jQuery('#resultBox').html(html);
  jQuery('#overlay').fadeIn(300);
}

jQuery(document).ready(function () {
  jQuery('#main').hide().fadeIn(600);

  jQuery('input.detailsBox').click(function () {
    jQuery(document.getElementById('d-' + this.value)).fadeToggle(300);
  });

  jQuery('#continueBtn').click(function () {
    if (jQuery('input.selectBox:checked').length === 0) {
      alert('الرجاء اختيار سيارة واحدة على الأقل');
      return;
    }
    jQuery('#bookingForm').slideDown(400);
  });

  jQuery('#bookingForm').submit(function (e) {
    e.preventDefault();
    jQuery('span.err').text('');
    var r = validateForm();
    var hasErr = false, key;
    for (key in r.errs) {
      if (r.errs.hasOwnProperty(key)) {
        jQuery('#e_' + key).text(r.errs[key]);
        hasErr = true;
      }
    }
    if (hasErr) { return; }
    var days = Math.round((r.end - r.start) / 86400000);
    showResult(days);
  });

  jQuery(document).on('click', '#closeBtn', function () {
    jQuery('#overlay').fadeOut(300);
  });
});
