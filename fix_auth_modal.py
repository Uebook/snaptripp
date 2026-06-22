import re

with open('/Users/vansh/ReactProject/mn356/Snaptrip/app/components/AuthModal.tsx', 'r') as f:
    content = f.read()

# Fix the invalid syntax for border in username input
fixed_content = content.replace(
    "border: f\"1px solid {'#ef4444' if usernameStatus in ['taken', 'invalid'] else '#10b981' if usernameStatus == 'available' else '#E5E7EB'}\",",
    "border: `1px solid ${usernameStatus === 'taken' || usernameStatus === 'invalid' ? '#ef4444' : usernameStatus === 'available' ? '#10b981' : '#E5E7EB'}`, "
)

# Fix the invalid syntax for color in username status icon
fixed_content = fixed_content.replace(
    "color: '#10b981' if usernameStatus == 'available' else '#ef4444' if usernameStatus in ['taken', 'invalid'] else '#64748b'",
    "color: usernameStatus === 'available' ? '#10b981' : (usernameStatus === 'taken' || usernameStatus === 'invalid') ? '#ef4444' : '#64748b'"
)

with open('/Users/vansh/ReactProject/mn356/Snaptrip/app/components/AuthModal.tsx', 'w') as f:
    f.write(fixed_content)

