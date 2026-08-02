# Colab Eval Results Viewer

Google Colab notebook and **dummy sample outputs** for exploring thesis evaluation results.

## Contents

| Path | Purpose |
|---|---|
| [`eval_results_colab.ipynb`](./eval_results_colab.ipynb) | Notebook: tables + charts for eval runs |
| [`sample_output/`](./sample_output/) | Dummy `eval/output`-shaped artifacts for demos |

Sample run id: `e2e-dummy-2026-08-02T12-00-00Z`

```
sample_output/
  processed/<runId>/   CSV + JSON summaries
  raw/<runId>/         Full JSON results
  logs/<runId>/        errors.log
```

This sample mimics an **E2E ChatService** run across 3 models and 12 cases. Values are synthetic (not from a real MQTT/device execution).

## Use in Google Colab

1. Open [`eval_results_colab.ipynb`](./eval_results_colab.ipynb) in [Colab](https://colab.research.google.com/) (**File → Upload notebook**).
2. Zip `sample_output/` (or your real `CORE/script/eval/output/`).
3. Run **Option A** and upload the zip.
4. Or in Colab, upload the whole `colab/` folder and set **Option C**:

```python
USE_LOCAL = True
RESULTS_ROOT = Path("/content/colab/sample_output")  # adjust to your upload path
```

## Use with real results

Point the notebook at `CORE/script/eval/output` after running:

```bash
npx tsx script/eval/cli/run-e2e-eval.ts --enable-real-device
# or
npx tsx script/eval/cli/run-llm-eval.ts
npx tsx script/eval/cli/run-integration.ts --mode dry-run
```

See also [`../README.md`](../README.md) and [`../eval/README.md`](../eval/README.md).
