import sys

with open('js/app.js', 'r') as f:
    content = f.read()

# Replace all renderReview(); with renderCurrentTab(); except for the ones where it's specific to review.
# Actually, since all these actions (lockObservation, updateObservation, deleteObservation, submitFeedback, submitGuestNote)
# happen in the Feed Item (which is now in journals tab for mentors/guests/execs, and possibly dashboard for trainees?),
# calling renderCurrentTab() is the safest and correct approach!

# Note: window.setFilterTrainee = function(val) { _filterTrainee = val; renderReview(); }; is still there. Wait, I deleted the Trainee filter from renderReview(). Oh, wait, I didn't delete the window.setFilterTrainee function definition, but it's fine.
# I will replace `renderReview();` with `renderCurrentTab();` globally in these window functions.

lines = content.split('\n')
for i, line in enumerate(lines):
    if "renderReview();" in line:
        if "window.setFilterTrainee" in line or "window.setFilterDept" in line:
            # specifically for window.setFilterDept and setFilterTrainee
            pass 
        elif "else if (state.activeTab === 'review')" in line:
            pass # Keep this one!
        else:
            lines[i] = line.replace("renderReview();", "renderCurrentTab();")

content = '\n'.join(lines)

with open('js/app.js', 'w') as f:
    f.write(content)

print("Patch applied.")
