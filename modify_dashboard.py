import re

filepath = 'd:/Aditya/Projects/DevHealth/frontend/src/pages/Dashboard.jsx'

with open(filepath, 'r') as f:
    content = f.read()

# Make sure we import our new chart component
if 'CodeQualityChart' not in content:
    content = content.replace(
        "import RoleGuard from '../components/RoleGuard';",
        "import RoleGuard from '../components/RoleGuard';\nimport CodeQualityChart from '../components/charts/CodeQualityChart';"
    )

snippet = """
        {/* SonarQube Code Quality */}
        <RoleGuard permission="code_quality">
          <div className="bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Code Quality Trends (SonarQube)</h2>
            <div className="h-80">
              <CodeQualityChart data={[]} />
            </div>
          </div>
        </RoleGuard>
"""

# inject right before the final closing tag sequence.
parts = content.split("      </div>\n    </div>\n  );\n}")
if len(parts) == 2:
    new_content = parts[0] + snippet + "      </div>\n    </div>\n  );\n}"
    with open(filepath, 'w') as f:
        f.write(new_content)
    print('Dashboard updated successfully.')
else:
    print('Split failed.')
