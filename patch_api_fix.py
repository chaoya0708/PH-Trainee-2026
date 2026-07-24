import re

with open('js/api.js', 'r') as f:
    content = f.read()

# Fix getMentorNotes
old_get = r"""    async getMentorNotes\(\) \{
      if \(CONFIG\.DEMO_MODE\) return lsGet\(LS_MENTOR_NOTES\);
      return callScriptGet\('getMentorNotes'\);
    \},"""
new_get = """    async getMentorNotes() {
      // Always use localStorage for private mentor notes for now
      return lsGet(LS_MENTOR_NOTES) || [];
    },"""
content = re.sub(old_get, new_get, content)

# Fix submitMentorNote
old_submit = r"""    async submitMentorNote\(traineeId, content, tags\) \{
      const record = \{
        id: 'mn-' \+ Date\.now\(\),
        traineeId,
        content,
        tags: tags \|\| \[\],
        createdAt: nowStr\(\)
      \};
      if \(CONFIG\.DEMO_MODE\) \{
        const list = lsGet\(LS_MENTOR_NOTES\);
        list\.unshift\(record\);
        lsSave\(LS_MENTOR_NOTES, list\);
        return \{ success: true, record \};
      \}
      return callScript\(\{
        action: 'submitMentorNote',
        \.\.\.record
      \}\);
    \},"""
new_submit = """    async submitMentorNote(traineeId, content, tags) {
      const record = {
        id: 'mn-' + Date.now(),
        traineeId,
        content,
        tags: tags || [],
        createdAt: nowStr()
      };
      // Always use localStorage for private mentor notes for now
      let list = lsGet(LS_MENTOR_NOTES) || [];
      list.unshift(record);
      lsSave(LS_MENTOR_NOTES, list);
      return { success: true, record };
    },"""
content = re.sub(old_submit, new_submit, content)

# Fix deleteMentorNote
old_del = r"""    async deleteMentorNote\(id\) \{
      if \(CONFIG\.DEMO_MODE\) \{
        let list = lsGet\(LS_MENTOR_NOTES\);
        list = list\.filter\(n => n\.id !== id\);
        lsSave\(LS_MENTOR_NOTES, list\);
        return \{ success: true \};
      \}
      return callScript\(\{ action: 'deleteMentorNote', id \}\);
    \},"""
new_del = """    async deleteMentorNote(id) {
      let list = lsGet(LS_MENTOR_NOTES) || [];
      list = list.filter(n => n.id !== id);
      lsSave(LS_MENTOR_NOTES, list);
      return { success: true };
    },"""
content = re.sub(old_del, new_del, content)

with open('js/api.js', 'w') as f:
    f.write(content)
