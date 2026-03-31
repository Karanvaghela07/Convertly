import re

with open('public/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

injection = '''
  <!-- ============ TRENDING TOOLS (NEW) ============ -->
  <section style="padding: 60px 0; background: linear-gradient(to bottom, #fff, #fafafa);">
    <div class="section-container">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 40px; flex-wrap: wrap; gap: 20px;">
        <div>
          <div style="display:inline-block; padding:6px 12px; background: rgba(229, 50, 45, 0.1); color: #E5322D; border-radius: 20px; font-size: 0.85rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom:12px;">?? Trending Next-Level Tools</div>
          <h2 style="font-size: 2.2rem; font-weight: 800; color: #1f2937; margin:0;">Supercharge Your Workflow</h2>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
        
        <!-- Protect PDF Card -->
        <a href="/protect-pdf.html" style="text-decoration:none; background:#fff; border-radius:16px; padding:32px; box-shadow:0 10px 30px rgba(0,0,0,0.04); border:1px solid #f3f4f6; transition:all 0.3s ease; position:relative; overflow:hidden;" class="trending-card">
          <div style="position:absolute; top:0; right:0; width:150px; height:150px; background: radial-gradient(circle, rgba(168,85,247,0.1) 0%, rgba(255,255,255,0) 70%); border-radius:50%; transform: translate(30%, -30%);"></div>
          <div style="width: 56px; height: 56px; border-radius: 14px; background: #faf5ff; color: #a855f7; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h3 style="font-size:1.3rem; font-weight:700; color:#1f2937; margin-bottom:12px;">Protect PDF (AES-256)</h3>
          <p style="color:#6b7280; line-height:1.6; margin:0;">Lock and encrypt your sensitive PDF files with a bank-grade secure password before sending via email.</p>
        </a>

        <!-- JSON to CSV Card -->
        <a href="/json-to-csv.html" style="text-decoration:none; background:#fff; border-radius:16px; padding:32px; box-shadow:0 10px 30px rgba(0,0,0,0.04); border:1px solid #f3f4f6; transition:all 0.3s ease; position:relative; overflow:hidden;" class="trending-card">
          <div style="position:absolute; top:0; right:0; width:150px; height:150px; background: radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(255,255,255,0) 70%); border-radius:50%; transform: translate(30%, -30%);"></div>
          <div style="width: 56px; height: 56px; border-radius: 14px; background: #eff6ff; color: #3b82f6; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
          </div>
          <h3 style="font-size:1.3rem; font-weight:700; color:#1f2937; margin-bottom:12px;">JSON to CSV Data Tool</h3>
          <p style="color:#6b7280; line-height:1.6; margin:0;">Instantly flatten nested JSON arrays from APIs into beautiful Excel and CSV spreadsheets.</p>
        </a>

      </div>
    </div>
    <style>
      .trending-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important;
        border-color: #e5e7eb !important;
      }
    </style>
  </section>
'''

content = content.replace('<!-- ============ WHY CHOOSE US (PREMIUM SECTION) ============ -->', injection + '\\n  <!-- ============ WHY CHOOSE US (PREMIUM SECTION) ============ -->')

with open('public/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected!")
