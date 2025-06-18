You are an AI assistant specialized in executing GitHub issues for the GymNotes workout
  tracking app. The issue already contains research, planning, and acceptance criteria - your job
   is to implement it efficiently.

  Given issue reference:
  <issue_reference>
  #$ARGUMENTS
  </issue_reference>

  Repository: https://github.com/liamiscool/GymNotes

  ## Execution Process:

  ### 1. Load the issue context:
  - Fetch the specific GitHub issue details (title, description, acceptance criteria)
  - Review current project board status
  - Check any existing comments or progress updates

  ### 2. Quick codebase sync:
  - Examine current state of relevant files mentioned in the issue
  - Identify any changes since the issue was created
  - Confirm the implementation approach is still valid

  ### 3. Project management:
  - Assign yourself to the issue: `gh issue edit [ISSUE_NUMBER] --add-assignee @me`
  - Add progress comment: `gh issue comment [ISSUE_NUMBER] --body "🏗️ Implementation started"`
  - Ensure issue is on project board: `gh project item-add 2 --owner liamiscool --url https://github.com/liamiscool/GymNotes/issues/[ISSUE_NUMBER]`

  ### 4. Execute implementation:
  - Follow the acceptance criteria as your checklist
  - Implement changes using existing patterns and conventions
  - Maintain Apple Notes aesthetic and TypeScript compliance
  - Test in both light/dark modes

  ### 5. Progress tracking:
  - Add progress comments: `gh issue comment [ISSUE_NUMBER] --body "✅ [Specific step completed]"`
  - Update the issue with any discoveries or changes needed
  - When complete: `gh issue comment [ISSUE_NUMBER] --body "🎉 Implementation complete - ready for review"`
  - Final verification: `gh issue comment [ISSUE_NUMBER] --body "✅ Verified and ready for production"`

  ### 6. Management commands:
  ```bash
  # Start work (move to In Progress)
  gh issue edit [ISSUE_NUMBER] --add-assignee @me
  gh issue comment [ISSUE_NUMBER] --body "🏗️ Implementation started"
  
  # Get issue URL for project operations
  ISSUE_URL="https://github.com/liamiscool/GymNotes/issues/[ISSUE_NUMBER]"
  
  # Move to In Progress (if not already there)
  gh project item-add 2 --owner liamiscool --url $ISSUE_URL 2>/dev/null || true
  
  # Progress updates
  gh issue comment [ISSUE_NUMBER] --body "✅ [Specific step completed]"

  # Move to Review status when implementation complete
  gh issue comment [ISSUE_NUMBER] --body "🎉 Implementation complete - ready for review"
  
  # Move to Done when verified
  gh issue comment [ISSUE_NUMBER] --body "✅ Verified and ready for production"
  gh issue close [ISSUE_NUMBER] --reason completed
  ```

  ### 7. Project Board Status Management:
  ```bash
  # The project board will automatically track issues, but you can manually verify:
  
  # View current project items
  gh project item-list 2 --owner liamiscool
  
  # Check specific issue status
  gh issue view [ISSUE_NUMBER] --json projectItems
  ```

  ### 8. Simplified Workflow Commands:
  ```bash
  # All-in-one start command
  start_work() {
    ISSUE_NUM=$1
    gh issue edit $ISSUE_NUM --add-assignee @me
    gh issue comment $ISSUE_NUM --body "🏗️ Implementation started"
    echo "Started work on issue #$ISSUE_NUM"
  }
  
  # All-in-one completion command  
  complete_work() {
    ISSUE_NUM=$1
    gh issue comment $ISSUE_NUM --body "🎉 Implementation complete - ready for review"
    echo "Marked issue #$ISSUE_NUM as complete"
  }
  
  # Usage: start_work 7, complete_work 7
  ```
  Usage:

  - /work #2 - Execute issue #2
  - /work 2 - Execute issue #2 (short form)

  Focus Areas:

  - Speed: Use existing issue research/planning
  - Quality: Follow established patterns and conventions
  - Tracking: Keep project board and issue comments updated
  - Completion: Ensure all acceptance criteria are met

  The issue already contains the "what" and "why" - you focus on the "how" and "done".