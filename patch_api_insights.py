import re

with open('js/api.js', 'r') as f:
    content = f.read()

# Add LS_MENTOR_NOTES
if 'const LS_MENTOR_NOTES' not in content:
    content = content.replace("const LS_ASSESS = 'ma_assessments';", "const LS_ASSESS = 'ma_assessments';\n  const LS_MENTOR_NOTES = 'ma_mentor_notes';")

# Add seed data for mentor notes
if 'localStorage.setItem(LS_MENTOR_NOTES' not in content:
    seed_logic = """    if (!localStorage.getItem(LS_MENTOR_NOTES)) {
      localStorage.setItem(LS_MENTOR_NOTES, JSON.stringify([]));
    }
  }"""
    content = content.replace("    if (!localStorage.getItem(LS_ASSESS)) {\n      localStorage.setItem(LS_ASSESS, JSON.stringify([]));\n    }\n  }", seed_logic)

# Add API methods getMentorNotes and submitMentorNote
if 'async getMentorNotes()' not in content:
    methods = """
    async getMentorNotes() {
      if (CONFIG.DEMO_MODE) return lsGet(LS_MENTOR_NOTES);
      return callScriptGet('getMentorNotes');
    },

    async submitMentorNote(traineeId, content, tags) {
      const record = {
        id: 'mn-' + Date.now(),
        traineeId,
        content,
        tags: tags || [],
        createdAt: nowStr()
      };
      if (CONFIG.DEMO_MODE) {
        const list = lsGet(LS_MENTOR_NOTES);
        list.unshift(record);
        lsSave(LS_MENTOR_NOTES, list);
        return { success: true, record };
      }
      return callScript({
        action: 'submitMentorNote',
        ...record
      });
    },

    async deleteMentorNote(id) {
      if (CONFIG.DEMO_MODE) {
        let list = lsGet(LS_MENTOR_NOTES);
        list = list.filter(n => n.id !== id);
        lsSave(LS_MENTOR_NOTES, list);
        return { success: true };
      }
      return callScript({ action: 'deleteMentorNote', id });
    },
"""
    content = content.replace("    async getAssessments() {", methods + "    async getAssessments() {")

with open('js/api.js', 'w') as f:
    f.write(content)
