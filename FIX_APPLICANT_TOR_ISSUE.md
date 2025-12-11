# 🔧 FIX: Applicant TOR Not Showing on Department Page

## 📊 Problem Summary

When students upload and process their TOR, the department page shows "No applicant TOR found" even though the student completed the extraction successfully.

## 🔍 Root Cause

The `update_tor_results` function in `curriculum/services.py` was **DELETING** failed subjects from the `CompareResultTOR` table instead of keeping them. This meant:

1. Student uploads TOR → Saved to `TorTransferee`
2. Student clicks "See Result" → Copied to `CompareResultTOR` (11 entries)
3. Student processes results → Failed subjects **DELETED** from `CompareResultTOR`
4. Department views request → No data found (all entries were deleted)

## ✅ Solution

**Changed**: `curriculum/services.py` - `update_tor_results()` function

**Before** (Line 434-437):
```python
# Delete failed subjects
deleted_count, _ = CompareResultTOR.objects.filter(
    account_id=account_id,
    subject_code__in=failed_subjects
).delete()  # ← DELETES the records!
```

**After**:
```python
# Mark failed subjects as DENIED instead of deleting them
failed_count = CompareResultTOR.objects.filter(
    account_id=account_id,
    subject_code__in=failed_subjects
).update(
    remarks="FAILED",
    credit_evaluation=CompareResultTOR.CreditEvaluation.DENIED,
    updated_at=models.F('updated_at')
)  # ← KEEPS the records, just marks them as FAILED
```

## 🚀 Deployment Steps

### 1. Upload Fixed File to Server

```powershell
# From Windows
scp "e:\Deployment\Cred-It\MainServer\curriculum\services.py" user@217.216.35.25:~/Cred-It-Deployment/MainServer/curriculum/
```

### 2. Restart Django Service

```bash
# On server
cd ~/Cred-It-Deployment/MainServer
docker-compose restart web

# Wait for restart
sleep 10

# Check status
docker-compose ps
```

### 3. Test the Fix

1. **Student Side** (test1):
   - Upload TOR
   - Click "See Result"
   - Process results
   - Click "Completed"
   - Submit "Request Accreditation"

2. **Department Side**:
   - Open the request
   - **Applicant's TOR should now show ALL subjects** (both passed and failed)
   - Failed subjects will have "DENIED" evaluation status

## 📝 What Changed

| Before | After |
|--------|-------|
| Failed subjects **deleted** | Failed subjects **kept** but marked as DENIED |
| Department sees empty TOR | Department sees all subjects |
| Lost data on failed subjects | Complete TOR history preserved |

## ✅ Benefits

1. **Complete Data**: Department can see all subjects the student took
2. **Better Evaluation**: Faculty can review why subjects were marked as failed
3. **Audit Trail**: Full history of student's academic record preserved
4. **Transparency**: Students and faculty see the same data

## 🎯 Expected Result

After the fix, when viewing a request on the department page:

**Applicant's TOR Table:**
| Subject Code | Description | Units | Final Grade | Evaluation | Remarks |
|--------------|-------------|-------|-------------|------------|---------|
| ICS 101L | Intro to Computing | 2.1 | 1 | Accepted | Passed |
| ICS 102 | Programming 1 | 2.4 | 20 | **Denied** | **Failed** |
| ... | ... | ... | ... | ... | ... |

✅ All subjects visible (both passed and failed)
✅ Failed subjects clearly marked with "DENIED" status
✅ Department can make informed decisions

---

**Status**: ✅ Fixed - Ready to deploy
**File Changed**: `MainServer/curriculum/services.py`
**Lines Modified**: 411-459
