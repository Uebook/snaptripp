
import os

def fix_css():
    path = 'app/home.css'
    with open(path, 'r') as f:
        content = f.read()

    # Split the file by parts we know are solid
    # Header ends before '/* 2. Search & Explore */'
    header_marker = '/* 2. Search & Explore */'
    if header_marker not in content:
        # Fallback if marker is gone
        header_marker = '.why-card:hover {'
        
    header_part = content.split(header_marker)[0] + header_marker
    
    # Footer starts after '.spin-action-btn {'
    footer_marker = '.spin-action-btn {'
    if footer_marker not in content:
        # Fallback
        footer_marker = '.drag-unlock-text {'
        
    footer_part = footer_marker + content.split(footer_marker)[-1]

    new_section = """
.search-explore {
  padding: 100px 80px;
  background: linear-gradient(135deg, #FFF5F2 0%, #FFFFFF 100%);
  display: flex;
  justify-content: space-between;
  gap: 60px;
  transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.explore-left {
  flex: 3;
  display: flex;
  flex-direction: column;
  gap: 40px;
  transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.search-explore.unlocked .explore-left {
  flex: 1;
}

.compact-search {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 18px;
  padding: 8px 15px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  position: relative;
}

.country-dropdown-list {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  max-height: 250px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 10px 30px rgba(0,0,0,0.12);
}

.dropdown-item {
  padding: 12px 20px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 0.95rem;
  color: #475569;
}

.dropdown-item:hover {
  background: #F8FAFC;
  color: #FFB72B;
}

.explore-v-card {
  width: 100%;
  max-width: 1100px;
  height: 600px;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 20px 50px rgba(0,0,0,0.1);
  transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.search-explore.unlocked .explore-v-card {
  max-width: 420px;
}

.search-orange-btn {
  background: #FFB72B;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: none;
  cursor: pointer;
  margin-right: 15px;
}

.compact-search input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  color: #64748B;
}

.search-chevron {
  color: #1a1a1a;
  font-size: 1.2rem;
  cursor: pointer;
}

.v-card-img {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}

.v-card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(10px);
  padding: 30px;
  margin: 15px;
  border-radius: 20px;
}

.v-card-overlay h3 {
  font-size: 1.6rem;
  font-weight: 500;
  margin-bottom: 10px;
}

.v-card-overlay h3 span {
  font-weight: 700;
}

.v-card-overlay p {
  font-size: 0.95rem;
  color: #475569;
  line-height: 1.5;
}

.explore-now-btn {
  background: #FFB72B;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 10px;
  font-weight: 600;
  margin-top: 20px;
  cursor: pointer;
}

/* Slider Component */
.vertical-slider-track {
  width: 10px;
  height: 600px;
  background: #FFE5B4;
  border-radius: 10px;
  position: relative;
  display: flex;
  justify-content: center;
}

.slider-handle {
  width: 45px;
  height: 80px;
  background: #FFB72B;
  border-radius: 18px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a1a1a;
  font-weight: bold;
  cursor: grab;
  box-shadow: 0 4px 15px rgba(255,183,43,0.4);
}

/* Explore Right / Spin It */
.explore-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 40px;
  transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.search-explore.unlocked .explore-right {
  flex: 2;
}

.spin-title {
  font-size: 3rem;
  font-weight: 500;
  color: #1E293B;
  margin-bottom: 40px;
}

.spin-title span {
  color: #FFB72B;
}

.spin-wheel-container {
  width: 480px;
  height: 480px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,183,43,0.08) 0%, rgba(255,183,43,0) 75%);
  border: 1px solid rgba(255,183,43,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-top: 20px;
  box-shadow: inset 0 0 50px rgba(255,183,43,0.05);
  overflow: hidden;
}

.spin-destinations-reel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  transition: transform 3s cubic-bezier(0.1, 0.7, 0.1, 1);
}

.spin-destinations-reel span {
  font-size: 2.2rem;
  font-weight: 800;
  color: #CBD5E1;
  text-transform: uppercase;
  letter-spacing: 2px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s;
}

.spin-destinations-reel span.active {
  color: #FFB72B;
  font-size: 2.6rem;
}

"""
    final_content = header_part + new_section + footer_part
    with open(path, 'w') as f:
        f.write(final_content)

if __name__ == '__main__':
    fix_css()
