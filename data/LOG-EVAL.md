# Log Evaluasi Model LLM — 100 Dataset x 3 Model x 3 Repetisi

Log mentah hasil menjalankan `npm run evaluate -- --model all --repetitions 3` di server produksi (AWS EC2, `/var/www/ginem-api`). Disimpan sebagai bukti/lampiran — isi log di bawah adalah salinan persis (verbatim) dari output terminal, tidak diedit.

| Keterangan | Nilai |
|---|---|
| Run ID | `run-2026-09-06-1036` |
| Dataset | `dataset.json` (100 kasus) |
| Model diuji | GPT-5.6 Luna, Claude Sonnet 5, DeepSeek-V4-Flash |
| Repetisi | 3x per kasus per model |
| Total record | 900 (100 x 3 x 3) |
| Status akhir | **Selesai** (`Done.`) — 900/900 record tercatat |

```log
ubuntu@ip-172-31-11-174:/var/www/ginem-api$ npm run evaluate -- --model all --repetitions 3

> taproject@1.0.0 evaluate
> ts-node --transpile-only evaluation/cli/evaluate.ts --model all --repetitions 3

◇ injected env (49) from .env // tip: ⌘ custom filepath { path: '/custom/path/.env' }
◇ injected env (0) from .env // tip: ⌘ override existing { override: true }
◇ injected env (0) from .env // tip: ⌘ multiple files { path: ['.env.local', '.env'] }
Run run-2026-09-06-1036: 100 case(s) x 3 model(s) x 3 repetition(s) = up to 900 record(s)
info: Connected to MQTT broker {"service":"backend-service","timestamp":"2026-09-06 10:36:12"}
[1/900] TC001 x GPT-5.6 Luna rep1 — OK
[2/900] TC001 x GPT-5.6 Luna rep2 — OK
[3/900] TC001 x GPT-5.6 Luna rep3 — OK
[4/900] TC002 x GPT-5.6 Luna rep1 — OK
[5/900] TC002 x GPT-5.6 Luna rep2 — OK
[6/900] TC002 x GPT-5.6 Luna rep3 — OK
[7/900] TC003 x GPT-5.6 Luna rep1 — OK
[8/900] TC003 x GPT-5.6 Luna rep2 — OK
[9/900] TC003 x GPT-5.6 Luna rep3 — OK
[10/900] TC004 x GPT-5.6 Luna rep1 — OK
[11/900] TC004 x GPT-5.6 Luna rep2 — OK
[12/900] TC004 x GPT-5.6 Luna rep3 — OK
[13/900] TC005 x GPT-5.6 Luna rep1 — OK
[14/900] TC005 x GPT-5.6 Luna rep2 — OK
[15/900] TC005 x GPT-5.6 Luna rep3 — OK
[16/900] TC006 x GPT-5.6 Luna rep1 — OK
[17/900] TC006 x GPT-5.6 Luna rep2 — OK
[18/900] TC006 x GPT-5.6 Luna rep3 — OK
[19/900] TC007 x GPT-5.6 Luna rep1 — OK
[20/900] TC007 x GPT-5.6 Luna rep2 — OK
[21/900] TC007 x GPT-5.6 Luna rep3 — OK
[22/900] TC008 x GPT-5.6 Luna rep1 — OK
[23/900] TC008 x GPT-5.6 Luna rep2 — OK
[24/900] TC008 x GPT-5.6 Luna rep3 — OK
[25/900] TC009 x GPT-5.6 Luna rep1 — OK
[26/900] TC009 x GPT-5.6 Luna rep2 — OK
[27/900] TC009 x GPT-5.6 Luna rep3 — OK
[28/900] TC010 x GPT-5.6 Luna rep1 — OK
[29/900] TC010 x GPT-5.6 Luna rep2 — OK
[30/900] TC010 x GPT-5.6 Luna rep3 — OK
[31/900] TC011 x GPT-5.6 Luna rep1 — OK
[32/900] TC011 x GPT-5.6 Luna rep2 — OK
[33/900] TC011 x GPT-5.6 Luna rep3 — OK
[34/900] TC012 x GPT-5.6 Luna rep1 — OK
[35/900] TC012 x GPT-5.6 Luna rep2 — OK
[36/900] TC012 x GPT-5.6 Luna rep3 — OK
[37/900] TC013 x GPT-5.6 Luna rep1 — OK
[38/900] TC013 x GPT-5.6 Luna rep2 — OK
[39/900] TC013 x GPT-5.6 Luna rep3 — OK
[40/900] TC014 x GPT-5.6 Luna rep1 — OK
[41/900] TC014 x GPT-5.6 Luna rep2 — OK
[42/900] TC014 x GPT-5.6 Luna rep3 — OK
[43/900] TC015 x GPT-5.6 Luna rep1 — OK
[44/900] TC015 x GPT-5.6 Luna rep2 — OK
[45/900] TC015 x GPT-5.6 Luna rep3 — OK
[46/900] TC016 x GPT-5.6 Luna rep1 — OK
[47/900] TC016 x GPT-5.6 Luna rep2 — OK
[48/900] TC016 x GPT-5.6 Luna rep3 — OK
[49/900] TC017 x GPT-5.6 Luna rep1 — OK
[50/900] TC017 x GPT-5.6 Luna rep2 — OK
[51/900] TC017 x GPT-5.6 Luna rep3 — OK
[52/900] TC018 x GPT-5.6 Luna rep1 — MISMATCH(INVALID_OR_MISSING_PARAMETER)
[53/900] TC018 x GPT-5.6 Luna rep2 — MISMATCH(INVALID_OR_MISSING_PARAMETER)
[54/900] TC018 x GPT-5.6 Luna rep3 — MISMATCH(INVALID_OR_MISSING_PARAMETER)
[55/900] TC019 x GPT-5.6 Luna rep1 — MISMATCH(INVALID_OR_MISSING_PARAMETER)
[56/900] TC019 x GPT-5.6 Luna rep2 — MISMATCH(INVALID_OR_MISSING_PARAMETER)
[57/900] TC019 x GPT-5.6 Luna rep3 — MISMATCH(INVALID_OR_MISSING_PARAMETER)
[58/900] TC020 x GPT-5.6 Luna rep1 — OK
[59/900] TC020 x GPT-5.6 Luna rep2 — OK
[60/900] TC020 x GPT-5.6 Luna rep3 — OK
[61/900] TC021 x GPT-5.6 Luna rep1 — OK
[62/900] TC021 x GPT-5.6 Luna rep2 — OK
[63/900] TC021 x GPT-5.6 Luna rep3 — OK
[64/900] TC022 x GPT-5.6 Luna rep1 — OK
[65/900] TC022 x GPT-5.6 Luna rep2 — OK
[66/900] TC022 x GPT-5.6 Luna rep3 — OK
[67/900] TC023 x GPT-5.6 Luna rep1 — OK
[68/900] TC023 x GPT-5.6 Luna rep2 — OK
[69/900] TC023 x GPT-5.6 Luna rep3 — OK
[70/900] TC024 x GPT-5.6 Luna rep1 — OK
[71/900] TC024 x GPT-5.6 Luna rep2 — OK
[72/900] TC024 x GPT-5.6 Luna rep3 — OK
[73/900] TC025 x GPT-5.6 Luna rep1 — OK
[74/900] TC025 x GPT-5.6 Luna rep2 — OK
[75/900] TC025 x GPT-5.6 Luna rep3 — OK
[76/900] TC026 x GPT-5.6 Luna rep1 — OK
[77/900] TC026 x GPT-5.6 Luna rep2 — OK
[78/900] TC026 x GPT-5.6 Luna rep3 — OK
[79/900] TC027 x GPT-5.6 Luna rep1 — OK
[80/900] TC027 x GPT-5.6 Luna rep2 — OK
[81/900] TC027 x GPT-5.6 Luna rep3 — OK
[82/900] TC028 x GPT-5.6 Luna rep1 — OK
[83/900] TC028 x GPT-5.6 Luna rep2 — OK
[84/900] TC028 x GPT-5.6 Luna rep3 — OK
[85/900] TC029 x GPT-5.6 Luna rep1 — OK
[86/900] TC029 x GPT-5.6 Luna rep2 — OK
[87/900] TC029 x GPT-5.6 Luna rep3 — OK
[88/900] TC030 x GPT-5.6 Luna rep1 — OK
[89/900] TC030 x GPT-5.6 Luna rep2 — OK
[90/900] TC030 x GPT-5.6 Luna rep3 — OK
[91/900] TC031 x GPT-5.6 Luna rep1 — OK
[92/900] TC031 x GPT-5.6 Luna rep2 — OK
[93/900] TC031 x GPT-5.6 Luna rep3 — OK
[94/900] TC032 x GPT-5.6 Luna rep1 — OK
[95/900] TC032 x GPT-5.6 Luna rep2 — OK
[96/900] TC032 x GPT-5.6 Luna rep3 — OK
[97/900] TC033 x GPT-5.6 Luna rep1 — OK
[98/900] TC033 x GPT-5.6 Luna rep2 — OK
[99/900] TC033 x GPT-5.6 Luna rep3 — OK
[100/900] TC034 x GPT-5.6 Luna rep1 — OK
[101/900] TC034 x GPT-5.6 Luna rep2 — OK
[102/900] TC034 x GPT-5.6 Luna rep3 — OK
[103/900] TC035 x GPT-5.6 Luna rep1 — OK
[104/900] TC035 x GPT-5.6 Luna rep2 — OK
[105/900] TC035 x GPT-5.6 Luna rep3 — OK
[106/900] TC036 x GPT-5.6 Luna rep1 — OK
[107/900] TC036 x GPT-5.6 Luna rep2 — OK
[108/900] TC036 x GPT-5.6 Luna rep3 — OK
[109/900] TC037 x GPT-5.6 Luna rep1 — OK
[110/900] TC037 x GPT-5.6 Luna rep2 — OK
[111/900] TC037 x GPT-5.6 Luna rep3 — OK
[112/900] TC038 x GPT-5.6 Luna rep1 — OK
[113/900] TC038 x GPT-5.6 Luna rep2 — OK
[114/900] TC038 x GPT-5.6 Luna rep3 — OK
[115/900] TC039 x GPT-5.6 Luna rep1 — OK
[116/900] TC039 x GPT-5.6 Luna rep2 — OK
[117/900] TC039 x GPT-5.6 Luna rep3 — OK
[118/900] TC040 x GPT-5.6 Luna rep1 — OK
[119/900] TC040 x GPT-5.6 Luna rep2 — OK
[120/900] TC040 x GPT-5.6 Luna rep3 — OK
[121/900] TC041 x GPT-5.6 Luna rep1 — OK
[122/900] TC041 x GPT-5.6 Luna rep2 — OK
[123/900] TC041 x GPT-5.6 Luna rep3 — OK
[124/900] TC042 x GPT-5.6 Luna rep1 — OK
[125/900] TC042 x GPT-5.6 Luna rep2 — OK
[126/900] TC042 x GPT-5.6 Luna rep3 — OK
[127/900] TC043 x GPT-5.6 Luna rep1 — OK
[128/900] TC043 x GPT-5.6 Luna rep2 — OK
[129/900] TC043 x GPT-5.6 Luna rep3 — OK
[130/900] TC044 x GPT-5.6 Luna rep1 — OK
[131/900] TC044 x GPT-5.6 Luna rep2 — OK
[132/900] TC044 x GPT-5.6 Luna rep3 — OK
[133/900] TC045 x GPT-5.6 Luna rep1 — OK
[134/900] TC045 x GPT-5.6 Luna rep2 — OK
[135/900] TC045 x GPT-5.6 Luna rep3 — OK
[136/900] TC046 x GPT-5.6 Luna rep1 — OK
[137/900] TC046 x GPT-5.6 Luna rep2 — OK
[138/900] TC046 x GPT-5.6 Luna rep3 — OK
[139/900] TC047 x GPT-5.6 Luna rep1 — OK
[140/900] TC047 x GPT-5.6 Luna rep2 — OK
[141/900] TC047 x GPT-5.6 Luna rep3 — OK
[142/900] TC048 x GPT-5.6 Luna rep1 — OK
[143/900] TC048 x GPT-5.6 Luna rep2 — OK
[144/900] TC048 x GPT-5.6 Luna rep3 — OK
[145/900] TC049 x GPT-5.6 Luna rep1 — OK
[146/900] TC049 x GPT-5.6 Luna rep2 — OK
[147/900] TC049 x GPT-5.6 Luna rep3 — OK
[148/900] TC050 x GPT-5.6 Luna rep1 — OK
[149/900] TC050 x GPT-5.6 Luna rep2 — OK
[150/900] TC050 x GPT-5.6 Luna rep3 — OK
[151/900] TC051 x GPT-5.6 Luna rep1 — OK
[152/900] TC051 x GPT-5.6 Luna rep2 — OK
[153/900] TC051 x GPT-5.6 Luna rep3 — OK
[154/900] TC052 x GPT-5.6 Luna rep1 — OK
[155/900] TC052 x GPT-5.6 Luna rep2 — OK
[156/900] TC052 x GPT-5.6 Luna rep3 — OK
[157/900] TC053 x GPT-5.6 Luna rep1 — OK
[158/900] TC053 x GPT-5.6 Luna rep2 — OK
[159/900] TC053 x GPT-5.6 Luna rep3 — OK
[160/900] TC054 x GPT-5.6 Luna rep1 — OK
[161/900] TC054 x GPT-5.6 Luna rep2 — OK
[162/900] TC054 x GPT-5.6 Luna rep3 — OK
[163/900] TC055 x GPT-5.6 Luna rep1 — OK
[164/900] TC055 x GPT-5.6 Luna rep2 — OK
[165/900] TC055 x GPT-5.6 Luna rep3 — OK
[166/900] TC056 x GPT-5.6 Luna rep1 — OK
[167/900] TC056 x GPT-5.6 Luna rep2 — OK
[168/900] TC056 x GPT-5.6 Luna rep3 — OK
[169/900] TC057 x GPT-5.6 Luna rep1 — MISMATCH(INVALID_OR_MISSING_PARAMETER)
[170/900] TC057 x GPT-5.6 Luna rep2 — MISMATCH(INVALID_OR_MISSING_PARAMETER)
[171/900] TC057 x GPT-5.6 Luna rep3 — MISMATCH(INVALID_OR_MISSING_PARAMETER)
[172/900] TC058 x GPT-5.6 Luna rep1 — OK
[173/900] TC058 x GPT-5.6 Luna rep2 — OK
[174/900] TC058 x GPT-5.6 Luna rep3 — OK
[175/900] TC059 x GPT-5.6 Luna rep1 — OK
[176/900] TC059 x GPT-5.6 Luna rep2 — OK
[177/900] TC059 x GPT-5.6 Luna rep3 — OK
[178/900] TC060 x GPT-5.6 Luna rep1 — OK
[179/900] TC060 x GPT-5.6 Luna rep2 — OK
[180/900] TC060 x GPT-5.6 Luna rep3 — OK
[181/900] TC061 x GPT-5.6 Luna rep1 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[182/900] TC061 x GPT-5.6 Luna rep2 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[183/900] TC061 x GPT-5.6 Luna rep3 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[184/900] TC062 x GPT-5.6 Luna rep1 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[185/900] TC062 x GPT-5.6 Luna rep2 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[186/900] TC062 x GPT-5.6 Luna rep3 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[187/900] TC063 x GPT-5.6 Luna rep1 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[188/900] TC063 x GPT-5.6 Luna rep2 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[189/900] TC063 x GPT-5.6 Luna rep3 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[190/900] TC064 x GPT-5.6 Luna rep1 — OK
[191/900] TC064 x GPT-5.6 Luna rep2 — OK
[192/900] TC064 x GPT-5.6 Luna rep3 — OK
[193/900] TC065 x GPT-5.6 Luna rep1 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[194/900] TC065 x GPT-5.6 Luna rep2 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[195/900] TC065 x GPT-5.6 Luna rep3 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[196/900] TC066 x GPT-5.6 Luna rep1 — OK
[197/900] TC066 x GPT-5.6 Luna rep2 — OK
[198/900] TC066 x GPT-5.6 Luna rep3 — OK
[199/900] TC067 x GPT-5.6 Luna rep1 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[200/900] TC067 x GPT-5.6 Luna rep2 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[201/900] TC067 x GPT-5.6 Luna rep3 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[202/900] TC068 x GPT-5.6 Luna rep1 — OK
[203/900] TC068 x GPT-5.6 Luna rep2 — OK
[204/900] TC068 x GPT-5.6 Luna rep3 — OK
[205/900] TC069 x GPT-5.6 Luna rep1 — OK
[206/900] TC069 x GPT-5.6 Luna rep2 — OK
[207/900] TC069 x GPT-5.6 Luna rep3 — OK
[208/900] TC070 x GPT-5.6 Luna rep1 — OK
[209/900] TC070 x GPT-5.6 Luna rep2 — OK
[210/900] TC070 x GPT-5.6 Luna rep3 — OK
[211/900] TC071 x GPT-5.6 Luna rep1 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[212/900] TC071 x GPT-5.6 Luna rep2 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[213/900] TC071 x GPT-5.6 Luna rep3 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[214/900] TC072 x GPT-5.6 Luna rep1 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[215/900] TC072 x GPT-5.6 Luna rep2 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[216/900] TC072 x GPT-5.6 Luna rep3 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[217/900] TC073 x GPT-5.6 Luna rep1 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[218/900] TC073 x GPT-5.6 Luna rep2 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[219/900] TC073 x GPT-5.6 Luna rep3 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[220/900] TC074 x GPT-5.6 Luna rep1 — OK
[221/900] TC074 x GPT-5.6 Luna rep2 — OK
[222/900] TC074 x GPT-5.6 Luna rep3 — OK
[223/900] TC075 x GPT-5.6 Luna rep1 — OK
[224/900] TC075 x GPT-5.6 Luna rep2 — OK
[225/900] TC075 x GPT-5.6 Luna rep3 — OK
[226/900] TC076 x GPT-5.6 Luna rep1 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[227/900] TC076 x GPT-5.6 Luna rep2 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[228/900] TC076 x GPT-5.6 Luna rep3 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[229/900] TC077 x GPT-5.6 Luna rep1 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[230/900] TC077 x GPT-5.6 Luna rep2 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[231/900] TC077 x GPT-5.6 Luna rep3 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[232/900] TC078 x GPT-5.6 Luna rep1 — OK
[233/900] TC078 x GPT-5.6 Luna rep2 — OK
[234/900] TC078 x GPT-5.6 Luna rep3 — OK
[235/900] TC079 x GPT-5.6 Luna rep1 — OK
[236/900] TC079 x GPT-5.6 Luna rep2 — OK
[237/900] TC079 x GPT-5.6 Luna rep3 — OK
[238/900] TC080 x GPT-5.6 Luna rep1 — OK
[239/900] TC080 x GPT-5.6 Luna rep2 — OK
[240/900] TC080 x GPT-5.6 Luna rep3 — OK
[241/900] TC081 x GPT-5.6 Luna rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[242/900] TC081 x GPT-5.6 Luna rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[243/900] TC081 x GPT-5.6 Luna rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[244/900] TC082 x GPT-5.6 Luna rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[245/900] TC082 x GPT-5.6 Luna rep2 — OK
[246/900] TC082 x GPT-5.6 Luna rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[247/900] TC083 x GPT-5.6 Luna rep1 — OK
[248/900] TC083 x GPT-5.6 Luna rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[249/900] TC083 x GPT-5.6 Luna rep3 — OK
[250/900] TC084 x GPT-5.6 Luna rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[251/900] TC084 x GPT-5.6 Luna rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[252/900] TC084 x GPT-5.6 Luna rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[253/900] TC085 x GPT-5.6 Luna rep1 — OK
[254/900] TC085 x GPT-5.6 Luna rep2 — OK
[255/900] TC085 x GPT-5.6 Luna rep3 — OK
[256/900] TC086 x GPT-5.6 Luna rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[257/900] TC086 x GPT-5.6 Luna rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[258/900] TC086 x GPT-5.6 Luna rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[259/900] TC087 x GPT-5.6 Luna rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[260/900] TC087 x GPT-5.6 Luna rep2 — OK
[261/900] TC087 x GPT-5.6 Luna rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[262/900] TC088 x GPT-5.6 Luna rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[263/900] TC088 x GPT-5.6 Luna rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[264/900] TC088 x GPT-5.6 Luna rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[265/900] TC089 x GPT-5.6 Luna rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[266/900] TC089 x GPT-5.6 Luna rep2 — OK
[267/900] TC089 x GPT-5.6 Luna rep3 — OK
[268/900] TC090 x GPT-5.6 Luna rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[269/900] TC090 x GPT-5.6 Luna rep2 — OK
[270/900] TC090 x GPT-5.6 Luna rep3 — OK
[271/900] TC091 x GPT-5.6 Luna rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[272/900] TC091 x GPT-5.6 Luna rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[273/900] TC091 x GPT-5.6 Luna rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[274/900] TC092 x GPT-5.6 Luna rep1 — OK
[275/900] TC092 x GPT-5.6 Luna rep2 — OK
[276/900] TC092 x GPT-5.6 Luna rep3 — OK
[277/900] TC093 x GPT-5.6 Luna rep1 — OK
[278/900] TC093 x GPT-5.6 Luna rep2 — OK
[279/900] TC093 x GPT-5.6 Luna rep3 — OK
[280/900] TC094 x GPT-5.6 Luna rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[281/900] TC094 x GPT-5.6 Luna rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[282/900] TC094 x GPT-5.6 Luna rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[283/900] TC095 x GPT-5.6 Luna rep1 — OK
[284/900] TC095 x GPT-5.6 Luna rep2 — OK
[285/900] TC095 x GPT-5.6 Luna rep3 — OK
[286/900] TC096 x GPT-5.6 Luna rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[287/900] TC096 x GPT-5.6 Luna rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[288/900] TC096 x GPT-5.6 Luna rep3 — OK
[289/900] TC097 x GPT-5.6 Luna rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[290/900] TC097 x GPT-5.6 Luna rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[291/900] TC097 x GPT-5.6 Luna rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[292/900] TC098 x GPT-5.6 Luna rep1 — OK
[293/900] TC098 x GPT-5.6 Luna rep2 — OK
[294/900] TC098 x GPT-5.6 Luna rep3 — OK
[295/900] TC099 x GPT-5.6 Luna rep1 — OK
[296/900] TC099 x GPT-5.6 Luna rep2 — OK
[297/900] TC099 x GPT-5.6 Luna rep3 — OK
[298/900] TC100 x GPT-5.6 Luna rep1 — OK
[299/900] TC100 x GPT-5.6 Luna rep2 — OK
[300/900] TC100 x GPT-5.6 Luna rep3 — OK
[301/900] TC001 x Claude Sonnet 5 rep1 — OK
[302/900] TC001 x Claude Sonnet 5 rep2 — OK
[303/900] TC001 x Claude Sonnet 5 rep3 — OK
[304/900] TC002 x Claude Sonnet 5 rep1 — OK
[305/900] TC002 x Claude Sonnet 5 rep2 — OK
[306/900] TC002 x Claude Sonnet 5 rep3 — OK
[307/900] TC003 x Claude Sonnet 5 rep1 — OK
[308/900] TC003 x Claude Sonnet 5 rep2 — OK
[309/900] TC003 x Claude Sonnet 5 rep3 — OK
[310/900] TC004 x Claude Sonnet 5 rep1 — OK
[311/900] TC004 x Claude Sonnet 5 rep2 — OK
[312/900] TC004 x Claude Sonnet 5 rep3 — OK
[313/900] TC005 x Claude Sonnet 5 rep1 — OK
[314/900] TC005 x Claude Sonnet 5 rep2 — OK
[315/900] TC005 x Claude Sonnet 5 rep3 — OK
[316/900] TC006 x Claude Sonnet 5 rep1 — OK
[317/900] TC006 x Claude Sonnet 5 rep2 — OK
[318/900] TC006 x Claude Sonnet 5 rep3 — OK
[319/900] TC007 x Claude Sonnet 5 rep1 — OK
[320/900] TC007 x Claude Sonnet 5 rep2 — OK
[321/900] TC007 x Claude Sonnet 5 rep3 — OK
[322/900] TC008 x Claude Sonnet 5 rep1 — OK
[323/900] TC008 x Claude Sonnet 5 rep2 — OK
[324/900] TC008 x Claude Sonnet 5 rep3 — OK
[325/900] TC009 x Claude Sonnet 5 rep1 — OK
[326/900] TC009 x Claude Sonnet 5 rep2 — OK
[327/900] TC009 x Claude Sonnet 5 rep3 — OK
[328/900] TC010 x Claude Sonnet 5 rep1 — OK
[329/900] TC010 x Claude Sonnet 5 rep2 — OK
[330/900] TC010 x Claude Sonnet 5 rep3 — OK
[331/900] TC011 x Claude Sonnet 5 rep1 — OK
[332/900] TC011 x Claude Sonnet 5 rep2 — OK
[333/900] TC011 x Claude Sonnet 5 rep3 — OK
[334/900] TC012 x Claude Sonnet 5 rep1 — OK
[335/900] TC012 x Claude Sonnet 5 rep2 — OK
[336/900] TC012 x Claude Sonnet 5 rep3 — OK
[337/900] TC013 x Claude Sonnet 5 rep1 — OK
[338/900] TC013 x Claude Sonnet 5 rep2 — OK
[339/900] TC013 x Claude Sonnet 5 rep3 — OK
[340/900] TC014 x Claude Sonnet 5 rep1 — OK
[341/900] TC014 x Claude Sonnet 5 rep2 — OK
[342/900] TC014 x Claude Sonnet 5 rep3 — OK
[343/900] TC015 x Claude Sonnet 5 rep1 — OK
[344/900] TC015 x Claude Sonnet 5 rep2 — OK
[345/900] TC015 x Claude Sonnet 5 rep3 — OK
[346/900] TC016 x Claude Sonnet 5 rep1 — OK
[347/900] TC016 x Claude Sonnet 5 rep2 — OK
[348/900] TC016 x Claude Sonnet 5 rep3 — OK
[349/900] TC017 x Claude Sonnet 5 rep1 — OK
[350/900] TC017 x Claude Sonnet 5 rep2 — OK
[351/900] TC017 x Claude Sonnet 5 rep3 — OK
[352/900] TC018 x Claude Sonnet 5 rep1 — OK
[353/900] TC018 x Claude Sonnet 5 rep2 — OK
[354/900] TC018 x Claude Sonnet 5 rep3 — OK
[355/900] TC019 x Claude Sonnet 5 rep1 — MISMATCH(INVALID_OR_MISSING_PARAMETER)
[356/900] TC019 x Claude Sonnet 5 rep2 — MISMATCH(INVALID_OR_MISSING_PARAMETER)
[357/900] TC019 x Claude Sonnet 5 rep3 — MISMATCH(INVALID_OR_MISSING_PARAMETER)
[358/900] TC020 x Claude Sonnet 5 rep1 — OK
[359/900] TC020 x Claude Sonnet 5 rep2 — OK
[360/900] TC020 x Claude Sonnet 5 rep3 — OK
[361/900] TC021 x Claude Sonnet 5 rep1 — OK
[362/900] TC021 x Claude Sonnet 5 rep2 — OK
[363/900] TC021 x Claude Sonnet 5 rep3 — OK
[364/900] TC022 x Claude Sonnet 5 rep1 — OK
[365/900] TC022 x Claude Sonnet 5 rep2 — OK
[366/900] TC022 x Claude Sonnet 5 rep3 — OK
[367/900] TC023 x Claude Sonnet 5 rep1 — OK
[368/900] TC023 x Claude Sonnet 5 rep2 — OK
[369/900] TC023 x Claude Sonnet 5 rep3 — OK
[370/900] TC024 x Claude Sonnet 5 rep1 — OK
[371/900] TC024 x Claude Sonnet 5 rep2 — OK
[372/900] TC024 x Claude Sonnet 5 rep3 — OK
[373/900] TC025 x Claude Sonnet 5 rep1 — OK
[374/900] TC025 x Claude Sonnet 5 rep2 — OK
[375/900] TC025 x Claude Sonnet 5 rep3 — OK
[376/900] TC026 x Claude Sonnet 5 rep1 — OK
[377/900] TC026 x Claude Sonnet 5 rep2 — OK
[378/900] TC026 x Claude Sonnet 5 rep3 — OK
[379/900] TC027 x Claude Sonnet 5 rep1 — OK
[380/900] TC027 x Claude Sonnet 5 rep2 — OK
[381/900] TC027 x Claude Sonnet 5 rep3 — OK
[382/900] TC028 x Claude Sonnet 5 rep1 — OK
[383/900] TC028 x Claude Sonnet 5 rep2 — OK
[384/900] TC028 x Claude Sonnet 5 rep3 — OK
[385/900] TC029 x Claude Sonnet 5 rep1 — OK
[386/900] TC029 x Claude Sonnet 5 rep2 — OK
[387/900] TC029 x Claude Sonnet 5 rep3 — OK
[388/900] TC030 x Claude Sonnet 5 rep1 — OK
[389/900] TC030 x Claude Sonnet 5 rep2 — OK
[390/900] TC030 x Claude Sonnet 5 rep3 — OK
[391/900] TC031 x Claude Sonnet 5 rep1 — OK
[392/900] TC031 x Claude Sonnet 5 rep2 — OK
[393/900] TC031 x Claude Sonnet 5 rep3 — OK
[394/900] TC032 x Claude Sonnet 5 rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[395/900] TC032 x Claude Sonnet 5 rep2 — OK
[396/900] TC032 x Claude Sonnet 5 rep3 — OK
[397/900] TC033 x Claude Sonnet 5 rep1 — OK
[398/900] TC033 x Claude Sonnet 5 rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[399/900] TC033 x Claude Sonnet 5 rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[400/900] TC034 x Claude Sonnet 5 rep1 — OK
[401/900] TC034 x Claude Sonnet 5 rep2 — OK
[402/900] TC034 x Claude Sonnet 5 rep3 — OK
[403/900] TC035 x Claude Sonnet 5 rep1 — OK
[404/900] TC035 x Claude Sonnet 5 rep2 — OK
[405/900] TC035 x Claude Sonnet 5 rep3 — OK
[406/900] TC036 x Claude Sonnet 5 rep1 — OK
[407/900] TC036 x Claude Sonnet 5 rep2 — OK
[408/900] TC036 x Claude Sonnet 5 rep3 — OK
[409/900] TC037 x Claude Sonnet 5 rep1 — OK
[410/900] TC037 x Claude Sonnet 5 rep2 — OK
[411/900] TC037 x Claude Sonnet 5 rep3 — OK
[412/900] TC038 x Claude Sonnet 5 rep1 — OK
[413/900] TC038 x Claude Sonnet 5 rep2 — OK
[414/900] TC038 x Claude Sonnet 5 rep3 — OK
[415/900] TC039 x Claude Sonnet 5 rep1 — OK
[416/900] TC039 x Claude Sonnet 5 rep2 — OK
[417/900] TC039 x Claude Sonnet 5 rep3 — OK
[418/900] TC040 x Claude Sonnet 5 rep1 — OK
[419/900] TC040 x Claude Sonnet 5 rep2 — OK
[420/900] TC040 x Claude Sonnet 5 rep3 — OK
[421/900] TC041 x Claude Sonnet 5 rep1 — OK
[422/900] TC041 x Claude Sonnet 5 rep2 — OK
[423/900] TC041 x Claude Sonnet 5 rep3 — OK
[424/900] TC042 x Claude Sonnet 5 rep1 — OK
[425/900] TC042 x Claude Sonnet 5 rep2 — OK
[426/900] TC042 x Claude Sonnet 5 rep3 — OK
[427/900] TC043 x Claude Sonnet 5 rep1 — OK
[428/900] TC043 x Claude Sonnet 5 rep2 — OK
[429/900] TC043 x Claude Sonnet 5 rep3 — OK
[430/900] TC044 x Claude Sonnet 5 rep1 — OK
[431/900] TC044 x Claude Sonnet 5 rep2 — OK
[432/900] TC044 x Claude Sonnet 5 rep3 — OK
[433/900] TC045 x Claude Sonnet 5 rep1 — OK
[434/900] TC045 x Claude Sonnet 5 rep2 — OK
[435/900] TC045 x Claude Sonnet 5 rep3 — OK
[436/900] TC046 x Claude Sonnet 5 rep1 — OK
[437/900] TC046 x Claude Sonnet 5 rep2 — OK
[438/900] TC046 x Claude Sonnet 5 rep3 — OK
[439/900] TC047 x Claude Sonnet 5 rep1 — OK
[440/900] TC047 x Claude Sonnet 5 rep2 — OK
[441/900] TC047 x Claude Sonnet 5 rep3 — OK
[442/900] TC048 x Claude Sonnet 5 rep1 — OK
[443/900] TC048 x Claude Sonnet 5 rep2 — OK
[444/900] TC048 x Claude Sonnet 5 rep3 — OK
[445/900] TC049 x Claude Sonnet 5 rep1 — OK
[446/900] TC049 x Claude Sonnet 5 rep2 — OK
[447/900] TC049 x Claude Sonnet 5 rep3 — OK
[448/900] TC050 x Claude Sonnet 5 rep1 — OK
[449/900] TC050 x Claude Sonnet 5 rep2 — OK
[450/900] TC050 x Claude Sonnet 5 rep3 — OK
[451/900] TC051 x Claude Sonnet 5 rep1 — OK
[452/900] TC051 x Claude Sonnet 5 rep2 — OK
[453/900] TC051 x Claude Sonnet 5 rep3 — OK
[454/900] TC052 x Claude Sonnet 5 rep1 — OK
[455/900] TC052 x Claude Sonnet 5 rep2 — OK
[456/900] TC052 x Claude Sonnet 5 rep3 — OK
[457/900] TC053 x Claude Sonnet 5 rep1 — OK
[458/900] TC053 x Claude Sonnet 5 rep2 — OK
[459/900] TC053 x Claude Sonnet 5 rep3 — OK
[460/900] TC054 x Claude Sonnet 5 rep1 — OK
[461/900] TC054 x Claude Sonnet 5 rep2 — OK
[462/900] TC054 x Claude Sonnet 5 rep3 — OK
[463/900] TC055 x Claude Sonnet 5 rep1 — OK
[464/900] TC055 x Claude Sonnet 5 rep2 — OK
[465/900] TC055 x Claude Sonnet 5 rep3 — OK
[466/900] TC056 x Claude Sonnet 5 rep1 — OK
[467/900] TC056 x Claude Sonnet 5 rep2 — OK
[468/900] TC056 x Claude Sonnet 5 rep3 — OK
[469/900] TC057 x Claude Sonnet 5 rep1 — OK
[470/900] TC057 x Claude Sonnet 5 rep2 — OK
[471/900] TC057 x Claude Sonnet 5 rep3 — OK
[472/900] TC058 x Claude Sonnet 5 rep1 — OK
[473/900] TC058 x Claude Sonnet 5 rep2 — OK
[474/900] TC058 x Claude Sonnet 5 rep3 — OK
[475/900] TC059 x Claude Sonnet 5 rep1 — OK
[476/900] TC059 x Claude Sonnet 5 rep2 — OK
[477/900] TC059 x Claude Sonnet 5 rep3 — OK
[478/900] TC060 x Claude Sonnet 5 rep1 — OK
[479/900] TC060 x Claude Sonnet 5 rep2 — OK
[480/900] TC060 x Claude Sonnet 5 rep3 — OK
[481/900] TC061 x Claude Sonnet 5 rep1 — OK
[482/900] TC061 x Claude Sonnet 5 rep2 — OK
[483/900] TC061 x Claude Sonnet 5 rep3 — OK
[484/900] TC062 x Claude Sonnet 5 rep1 — OK
[485/900] TC062 x Claude Sonnet 5 rep2 — OK
[486/900] TC062 x Claude Sonnet 5 rep3 — OK
[487/900] TC063 x Claude Sonnet 5 rep1 — OK
[488/900] TC063 x Claude Sonnet 5 rep2 — OK
[489/900] TC063 x Claude Sonnet 5 rep3 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[490/900] TC064 x Claude Sonnet 5 rep1 — OK
[491/900] TC064 x Claude Sonnet 5 rep2 — OK
[492/900] TC064 x Claude Sonnet 5 rep3 — OK
[493/900] TC065 x Claude Sonnet 5 rep1 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[494/900] TC065 x Claude Sonnet 5 rep2 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[495/900] TC065 x Claude Sonnet 5 rep3 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[496/900] TC066 x Claude Sonnet 5 rep1 — OK
[497/900] TC066 x Claude Sonnet 5 rep2 — OK
[498/900] TC066 x Claude Sonnet 5 rep3 — OK
[499/900] TC067 x Claude Sonnet 5 rep1 — OK
[500/900] TC067 x Claude Sonnet 5 rep2 — OK
[501/900] TC067 x Claude Sonnet 5 rep3 — OK
[502/900] TC068 x Claude Sonnet 5 rep1 — OK
[503/900] TC068 x Claude Sonnet 5 rep2 — OK
[504/900] TC068 x Claude Sonnet 5 rep3 — OK
[505/900] TC069 x Claude Sonnet 5 rep1 — OK
[506/900] TC069 x Claude Sonnet 5 rep2 — OK
[507/900] TC069 x Claude Sonnet 5 rep3 — OK
[508/900] TC070 x Claude Sonnet 5 rep1 — OK
[509/900] TC070 x Claude Sonnet 5 rep2 — OK
[510/900] TC070 x Claude Sonnet 5 rep3 — OK
[511/900] TC071 x Claude Sonnet 5 rep1 — OK
[512/900] TC071 x Claude Sonnet 5 rep2 — OK
[513/900] TC071 x Claude Sonnet 5 rep3 — OK
[514/900] TC072 x Claude Sonnet 5 rep1 — OK
[515/900] TC072 x Claude Sonnet 5 rep2 — OK
[516/900] TC072 x Claude Sonnet 5 rep3 — OK
[517/900] TC073 x Claude Sonnet 5 rep1 — OK
[518/900] TC073 x Claude Sonnet 5 rep2 — OK
[519/900] TC073 x Claude Sonnet 5 rep3 — OK
[520/900] TC074 x Claude Sonnet 5 rep1 — OK
[521/900] TC074 x Claude Sonnet 5 rep2 — OK
[522/900] TC074 x Claude Sonnet 5 rep3 — OK
[523/900] TC075 x Claude Sonnet 5 rep1 — OK
[524/900] TC075 x Claude Sonnet 5 rep2 — OK
[525/900] TC075 x Claude Sonnet 5 rep3 — OK
[526/900] TC076 x Claude Sonnet 5 rep1 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[527/900] TC076 x Claude Sonnet 5 rep2 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[528/900] TC076 x Claude Sonnet 5 rep3 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[529/900] TC077 x Claude Sonnet 5 rep1 — OK
[530/900] TC077 x Claude Sonnet 5 rep2 — OK
[531/900] TC077 x Claude Sonnet 5 rep3 — OK
[532/900] TC078 x Claude Sonnet 5 rep1 — OK
[533/900] TC078 x Claude Sonnet 5 rep2 — OK
[534/900] TC078 x Claude Sonnet 5 rep3 — OK
[535/900] TC079 x Claude Sonnet 5 rep1 — OK
[536/900] TC079 x Claude Sonnet 5 rep2 — OK
[537/900] TC079 x Claude Sonnet 5 rep3 — OK
[538/900] TC080 x Claude Sonnet 5 rep1 — OK
[539/900] TC080 x Claude Sonnet 5 rep2 — OK
[540/900] TC080 x Claude Sonnet 5 rep3 — OK
[541/900] TC081 x Claude Sonnet 5 rep1 — OK
[542/900] TC081 x Claude Sonnet 5 rep2 — OK
[543/900] TC081 x Claude Sonnet 5 rep3 — OK
[544/900] TC082 x Claude Sonnet 5 rep1 — OK
[545/900] TC082 x Claude Sonnet 5 rep2 — OK
[546/900] TC082 x Claude Sonnet 5 rep3 — OK
[547/900] TC083 x Claude Sonnet 5 rep1 — OK
[548/900] TC083 x Claude Sonnet 5 rep2 — OK
[549/900] TC083 x Claude Sonnet 5 rep3 — OK
[550/900] TC084 x Claude Sonnet 5 rep1 — OK
[551/900] TC084 x Claude Sonnet 5 rep2 — OK
[552/900] TC084 x Claude Sonnet 5 rep3 — OK
[553/900] TC085 x Claude Sonnet 5 rep1 — OK
[554/900] TC085 x Claude Sonnet 5 rep2 — OK
[555/900] TC085 x Claude Sonnet 5 rep3 — OK
[556/900] TC086 x Claude Sonnet 5 rep1 — OK
[557/900] TC086 x Claude Sonnet 5 rep2 — OK
[558/900] TC086 x Claude Sonnet 5 rep3 — OK
[559/900] TC087 x Claude Sonnet 5 rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[560/900] TC087 x Claude Sonnet 5 rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[561/900] TC087 x Claude Sonnet 5 rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[562/900] TC088 x Claude Sonnet 5 rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[563/900] TC088 x Claude Sonnet 5 rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[564/900] TC088 x Claude Sonnet 5 rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[565/900] TC089 x Claude Sonnet 5 rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[566/900] TC089 x Claude Sonnet 5 rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[567/900] TC089 x Claude Sonnet 5 rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[568/900] TC090 x Claude Sonnet 5 rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[569/900] TC090 x Claude Sonnet 5 rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[570/900] TC090 x Claude Sonnet 5 rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[571/900] TC091 x Claude Sonnet 5 rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[572/900] TC091 x Claude Sonnet 5 rep2 — OK
[573/900] TC091 x Claude Sonnet 5 rep3 — OK
[574/900] TC092 x Claude Sonnet 5 rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[575/900] TC092 x Claude Sonnet 5 rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[576/900] TC092 x Claude Sonnet 5 rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[577/900] TC093 x Claude Sonnet 5 rep1 — OK
[578/900] TC093 x Claude Sonnet 5 rep2 — OK
[579/900] TC093 x Claude Sonnet 5 rep3 — OK
[580/900] TC094 x Claude Sonnet 5 rep1 — OK
[581/900] TC094 x Claude Sonnet 5 rep2 — OK
[582/900] TC094 x Claude Sonnet 5 rep3 — OK
[583/900] TC095 x Claude Sonnet 5 rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[584/900] TC095 x Claude Sonnet 5 rep2 — OK
[585/900] TC095 x Claude Sonnet 5 rep3 — OK
[586/900] TC096 x Claude Sonnet 5 rep1 — OK
[587/900] TC096 x Claude Sonnet 5 rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[588/900] TC096 x Claude Sonnet 5 rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[589/900] TC097 x Claude Sonnet 5 rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[590/900] TC097 x Claude Sonnet 5 rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[591/900] TC097 x Claude Sonnet 5 rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[592/900] TC098 x Claude Sonnet 5 rep1 — OK
[593/900] TC098 x Claude Sonnet 5 rep2 — OK
[594/900] TC098 x Claude Sonnet 5 rep3 — OK
[595/900] TC099 x Claude Sonnet 5 rep1 — OK
[596/900] TC099 x Claude Sonnet 5 rep2 — OK
[597/900] TC099 x Claude Sonnet 5 rep3 — OK
[598/900] TC100 x Claude Sonnet 5 rep1 — OK
[599/900] TC100 x Claude Sonnet 5 rep2 — OK
[600/900] TC100 x Claude Sonnet 5 rep3 — OK
[601/900] TC001 x DeepSeek-V4-Flash rep1 — OK
[602/900] TC001 x DeepSeek-V4-Flash rep2 — OK
[603/900] TC001 x DeepSeek-V4-Flash rep3 — OK
[604/900] TC002 x DeepSeek-V4-Flash rep1 — OK
[605/900] TC002 x DeepSeek-V4-Flash rep2 — OK
[606/900] TC002 x DeepSeek-V4-Flash rep3 — OK
[607/900] TC003 x DeepSeek-V4-Flash rep1 — OK
[608/900] TC003 x DeepSeek-V4-Flash rep2 — OK
[609/900] TC003 x DeepSeek-V4-Flash rep3 — OK
[610/900] TC004 x DeepSeek-V4-Flash rep1 — OK
[611/900] TC004 x DeepSeek-V4-Flash rep2 — OK
[612/900] TC004 x DeepSeek-V4-Flash rep3 — OK
[613/900] TC005 x DeepSeek-V4-Flash rep1 — OK
[614/900] TC005 x DeepSeek-V4-Flash rep2 — OK
[615/900] TC005 x DeepSeek-V4-Flash rep3 — OK
[616/900] TC006 x DeepSeek-V4-Flash rep1 — OK
[617/900] TC006 x DeepSeek-V4-Flash rep2 — OK
[618/900] TC006 x DeepSeek-V4-Flash rep3 — OK
[619/900] TC007 x DeepSeek-V4-Flash rep1 — OK
[620/900] TC007 x DeepSeek-V4-Flash rep2 — OK
[621/900] TC007 x DeepSeek-V4-Flash rep3 — OK
[622/900] TC008 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[623/900] TC008 x DeepSeek-V4-Flash rep2 — OK
[624/900] TC008 x DeepSeek-V4-Flash rep3 — OK
[625/900] TC009 x DeepSeek-V4-Flash rep1 — OK
[626/900] TC009 x DeepSeek-V4-Flash rep2 — OK
[627/900] TC009 x DeepSeek-V4-Flash rep3 — OK
[628/900] TC010 x DeepSeek-V4-Flash rep1 — OK
[629/900] TC010 x DeepSeek-V4-Flash rep2 — OK
[630/900] TC010 x DeepSeek-V4-Flash rep3 — OK
[631/900] TC011 x DeepSeek-V4-Flash rep1 — OK
[632/900] TC011 x DeepSeek-V4-Flash rep2 — OK
[633/900] TC011 x DeepSeek-V4-Flash rep3 — OK
[634/900] TC012 x DeepSeek-V4-Flash rep1 — OK
[635/900] TC012 x DeepSeek-V4-Flash rep2 — OK
[636/900] TC012 x DeepSeek-V4-Flash rep3 — OK
[637/900] TC013 x DeepSeek-V4-Flash rep1 — OK
[638/900] TC013 x DeepSeek-V4-Flash rep2 — OK
[639/900] TC013 x DeepSeek-V4-Flash rep3 — OK
[640/900] TC014 x DeepSeek-V4-Flash rep1 — OK
[641/900] TC014 x DeepSeek-V4-Flash rep2 — OK
[642/900] TC014 x DeepSeek-V4-Flash rep3 — OK
[643/900] TC015 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[644/900] TC015 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[645/900] TC015 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[646/900] TC016 x DeepSeek-V4-Flash rep1 — OK
[647/900] TC016 x DeepSeek-V4-Flash rep2 — OK
[648/900] TC016 x DeepSeek-V4-Flash rep3 — OK
[649/900] TC017 x DeepSeek-V4-Flash rep1 — OK
[650/900] TC017 x DeepSeek-V4-Flash rep2 — OK
[651/900] TC017 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[652/900] TC018 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[653/900] TC018 x DeepSeek-V4-Flash rep2 — OK
[654/900] TC018 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[655/900] TC019 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[656/900] TC019 x DeepSeek-V4-Flash rep2 — MISMATCH(INVALID_OR_MISSING_PARAMETER)
[657/900] TC019 x DeepSeek-V4-Flash rep3 — MISMATCH(INVALID_OR_MISSING_PARAMETER)
[658/900] TC020 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
error: [ChatService] query failed: Error: 400 The `reasoning_content` in the thinking mode must be passed back to the API. {"service":"backend-service","timestamp":"2026-09-06 11:33:59"}
[659/900] TC020 x DeepSeek-V4-Flash rep2 — OK
[660/900] TC020 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[661/900] TC021 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[662/900] TC021 x DeepSeek-V4-Flash rep2 — MISMATCH(WRONG_TOOL)
[663/900] TC021 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[664/900] TC022 x DeepSeek-V4-Flash rep1 — OK
[665/900] TC022 x DeepSeek-V4-Flash rep2 — OK
[666/900] TC022 x DeepSeek-V4-Flash rep3 — OK
[667/900] TC023 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[668/900] TC023 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[669/900] TC023 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[670/900] TC024 x DeepSeek-V4-Flash rep1 — OK
[671/900] TC024 x DeepSeek-V4-Flash rep2 — OK
[672/900] TC024 x DeepSeek-V4-Flash rep3 — OK
[673/900] TC025 x DeepSeek-V4-Flash rep1 — OK
[674/900] TC025 x DeepSeek-V4-Flash rep2 — OK
[675/900] TC025 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[676/900] TC026 x DeepSeek-V4-Flash rep1 — OK
[677/900] TC026 x DeepSeek-V4-Flash rep2 — OK
[678/900] TC026 x DeepSeek-V4-Flash rep3 — OK
[679/900] TC027 x DeepSeek-V4-Flash rep1 — OK
[680/900] TC027 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[681/900] TC027 x DeepSeek-V4-Flash rep3 — OK
[682/900] TC028 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
New LangChain packages are available that more efficiently handle tool calling.

Please upgrade your packages to versions that set message tool calls. e.g., `pnpm install @langchain/anthropic`, pnpm install @langchain/openai`, etc.
New LangChain packages are available that more efficiently handle tool calling.

Please upgrade your packages to versions that set message tool calls. e.g., `pnpm install @langchain/anthropic`, pnpm install @langchain/openai`, etc.
[683/900] TC028 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[684/900] TC028 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[685/900] TC029 x DeepSeek-V4-Flash rep1 — OK
[686/900] TC029 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[687/900] TC029 x DeepSeek-V4-Flash rep3 — OK
[688/900] TC030 x DeepSeek-V4-Flash rep1 — OK
[689/900] TC030 x DeepSeek-V4-Flash rep2 — OK
[690/900] TC030 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[691/900] TC031 x DeepSeek-V4-Flash rep1 — OK
[692/900] TC031 x DeepSeek-V4-Flash rep2 — OK
[693/900] TC031 x DeepSeek-V4-Flash rep3 — OK
[694/900] TC032 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[695/900] TC032 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[696/900] TC032 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[697/900] TC033 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[698/900] TC033 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[699/900] TC033 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[700/900] TC034 x DeepSeek-V4-Flash rep1 — OK
[701/900] TC034 x DeepSeek-V4-Flash rep2 — OK
[702/900] TC034 x DeepSeek-V4-Flash rep3 — OK
[703/900] TC035 x DeepSeek-V4-Flash rep1 — OK
[704/900] TC035 x DeepSeek-V4-Flash rep2 — OK
[705/900] TC035 x DeepSeek-V4-Flash rep3 — OK
[706/900] TC036 x DeepSeek-V4-Flash rep1 — OK
[707/900] TC036 x DeepSeek-V4-Flash rep2 — OK
[708/900] TC036 x DeepSeek-V4-Flash rep3 — OK
[709/900] TC037 x DeepSeek-V4-Flash rep1 — OK
[710/900] TC037 x DeepSeek-V4-Flash rep2 — OK
[711/900] TC037 x DeepSeek-V4-Flash rep3 — OK
[712/900] TC038 x DeepSeek-V4-Flash rep1 — OK
[713/900] TC038 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[714/900] TC038 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[715/900] TC039 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[716/900] TC039 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[717/900] TC039 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[718/900] TC040 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[719/900] TC040 x DeepSeek-V4-Flash rep2 — OK
[720/900] TC040 x DeepSeek-V4-Flash rep3 — OK
[721/900] TC041 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[722/900] TC041 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[723/900] TC041 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[724/900] TC042 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[725/900] TC042 x DeepSeek-V4-Flash rep2 — OK
[726/900] TC042 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[727/900] TC043 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[728/900] TC043 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[729/900] TC043 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[730/900] TC044 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[731/900] TC044 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[732/900] TC044 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[733/900] TC045 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[734/900] TC045 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[735/900] TC045 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[736/900] TC046 x DeepSeek-V4-Flash rep1 — OK
[737/900] TC046 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[738/900] TC046 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[739/900] TC047 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[740/900] TC047 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[741/900] TC047 x DeepSeek-V4-Flash rep3 — OK
[742/900] TC048 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[743/900] TC048 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[744/900] TC048 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[745/900] TC049 x DeepSeek-V4-Flash rep1 — OK
[746/900] TC049 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[747/900] TC049 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[748/900] TC050 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[749/900] TC050 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[750/900] TC050 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[751/900] TC051 x DeepSeek-V4-Flash rep1 — OK
[752/900] TC051 x DeepSeek-V4-Flash rep2 — OK
[753/900] TC051 x DeepSeek-V4-Flash rep3 — OK
[754/900] TC052 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[755/900] TC052 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[756/900] TC052 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[757/900] TC053 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[758/900] TC053 x DeepSeek-V4-Flash rep2 — OK
[759/900] TC053 x DeepSeek-V4-Flash rep3 — OK
[760/900] TC054 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[761/900] TC054 x DeepSeek-V4-Flash rep2 — OK
[762/900] TC054 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[763/900] TC055 x DeepSeek-V4-Flash rep1 — OK
[764/900] TC055 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[765/900] TC055 x DeepSeek-V4-Flash rep3 — OK
[766/900] TC056 x DeepSeek-V4-Flash rep1 — OK
[767/900] TC056 x DeepSeek-V4-Flash rep2 — OK
[768/900] TC056 x DeepSeek-V4-Flash rep3 — OK
[769/900] TC057 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[770/900] TC057 x DeepSeek-V4-Flash rep2 — OK
[771/900] TC057 x DeepSeek-V4-Flash rep3 — OK
[772/900] TC058 x DeepSeek-V4-Flash rep1 — OK
[773/900] TC058 x DeepSeek-V4-Flash rep2 — MISMATCH(WRONG_TOOL|UNNECESSARY_TOOL_CALL)
[774/900] TC058 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[775/900] TC059 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[776/900] TC059 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[777/900] TC059 x DeepSeek-V4-Flash rep3 — OK
[778/900] TC060 x DeepSeek-V4-Flash rep1 — OK
[779/900] TC060 x DeepSeek-V4-Flash rep2 — OK
[780/900] TC060 x DeepSeek-V4-Flash rep3 — OK
[781/900] TC061 x DeepSeek-V4-Flash rep1 — OK
[782/900] TC061 x DeepSeek-V4-Flash rep2 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[783/900] TC061 x DeepSeek-V4-Flash rep3 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[784/900] TC062 x DeepSeek-V4-Flash rep1 — OK
[785/900] TC062 x DeepSeek-V4-Flash rep2 — OK
[786/900] TC062 x DeepSeek-V4-Flash rep3 — OK
[787/900] TC063 x DeepSeek-V4-Flash rep1 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[788/900] TC063 x DeepSeek-V4-Flash rep2 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[789/900] TC063 x DeepSeek-V4-Flash rep3 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[790/900] TC064 x DeepSeek-V4-Flash rep1 — OK
[791/900] TC064 x DeepSeek-V4-Flash rep2 — OK
[792/900] TC064 x DeepSeek-V4-Flash rep3 — OK
[793/900] TC065 x DeepSeek-V4-Flash rep1 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[794/900] TC065 x DeepSeek-V4-Flash rep2 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[795/900] TC065 x DeepSeek-V4-Flash rep3 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[796/900] TC066 x DeepSeek-V4-Flash rep1 — OK
[797/900] TC066 x DeepSeek-V4-Flash rep2 — OK
[798/900] TC066 x DeepSeek-V4-Flash rep3 — OK
[799/900] TC067 x DeepSeek-V4-Flash rep1 — OK
[800/900] TC067 x DeepSeek-V4-Flash rep2 — OK
[801/900] TC067 x DeepSeek-V4-Flash rep3 — OK
[802/900] TC068 x DeepSeek-V4-Flash rep1 — OK
[803/900] TC068 x DeepSeek-V4-Flash rep2 — OK
[804/900] TC068 x DeepSeek-V4-Flash rep3 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[805/900] TC069 x DeepSeek-V4-Flash rep1 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[806/900] TC069 x DeepSeek-V4-Flash rep2 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[807/900] TC069 x DeepSeek-V4-Flash rep3 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[808/900] TC070 x DeepSeek-V4-Flash rep1 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[809/900] TC070 x DeepSeek-V4-Flash rep2 — OK
[810/900] TC070 x DeepSeek-V4-Flash rep3 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
error: [ChatService] query failed: Error: 400 The `reasoning_content` in the thinking mode must be passed back to the API. {"service":"backend-service","timestamp":"2026-09-06 11:52:58"}
[811/900] TC071 x DeepSeek-V4-Flash rep1 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[812/900] TC071 x DeepSeek-V4-Flash rep2 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[813/900] TC071 x DeepSeek-V4-Flash rep3 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[814/900] TC072 x DeepSeek-V4-Flash rep1 — OK
[815/900] TC072 x DeepSeek-V4-Flash rep2 — OK
[816/900] TC072 x DeepSeek-V4-Flash rep3 — OK
[817/900] TC073 x DeepSeek-V4-Flash rep1 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[818/900] TC073 x DeepSeek-V4-Flash rep2 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[819/900] TC073 x DeepSeek-V4-Flash rep3 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[820/900] TC074 x DeepSeek-V4-Flash rep1 — OK
[821/900] TC074 x DeepSeek-V4-Flash rep2 — OK
[822/900] TC074 x DeepSeek-V4-Flash rep3 — OK
[823/900] TC075 x DeepSeek-V4-Flash rep1 — OK
[824/900] TC075 x DeepSeek-V4-Flash rep2 — OK
[825/900] TC075 x DeepSeek-V4-Flash rep3 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[826/900] TC076 x DeepSeek-V4-Flash rep1 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[827/900] TC076 x DeepSeek-V4-Flash rep2 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[828/900] TC076 x DeepSeek-V4-Flash rep3 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[829/900] TC077 x DeepSeek-V4-Flash rep1 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[830/900] TC077 x DeepSeek-V4-Flash rep2 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[831/900] TC077 x DeepSeek-V4-Flash rep3 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[832/900] TC078 x DeepSeek-V4-Flash rep1 — OK
[833/900] TC078 x DeepSeek-V4-Flash rep2 — OK
[834/900] TC078 x DeepSeek-V4-Flash rep3 — OK
[835/900] TC079 x DeepSeek-V4-Flash rep1 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[836/900] TC079 x DeepSeek-V4-Flash rep2 — OK
[837/900] TC079 x DeepSeek-V4-Flash rep3 — OK
[838/900] TC080 x DeepSeek-V4-Flash rep1 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[839/900] TC080 x DeepSeek-V4-Flash rep2 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[840/900] TC080 x DeepSeek-V4-Flash rep3 — MISMATCH(FAILED_CLARIFICATION|UNNECESSARY_TOOL_CALL)
[841/900] TC081 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[842/900] TC081 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[843/900] TC081 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[844/900] TC082 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[845/900] TC082 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[846/900] TC082 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[847/900] TC083 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[848/900] TC083 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[849/900] TC083 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[850/900] TC084 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[851/900] TC084 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[852/900] TC084 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[853/900] TC085 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[854/900] TC085 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[855/900] TC085 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[856/900] TC086 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[857/900] TC086 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[858/900] TC086 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[859/900] TC087 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[860/900] TC087 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[861/900] TC087 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[862/900] TC088 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[863/900] TC088 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[864/900] TC088 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[865/900] TC089 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[866/900] TC089 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[867/900] TC089 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[868/900] TC090 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[869/900] TC090 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[870/900] TC090 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[871/900] TC091 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[872/900] TC091 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[873/900] TC091 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[874/900] TC092 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[875/900] TC092 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[876/900] TC092 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[877/900] TC093 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[878/900] TC093 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[879/900] TC093 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[880/900] TC094 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[881/900] TC094 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[882/900] TC094 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[883/900] TC095 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[884/900] TC095 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[885/900] TC095 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[886/900] TC096 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[887/900] TC096 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[888/900] TC096 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[889/900] TC097 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[890/900] TC097 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[891/900] TC097 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)
[892/900] TC098 x DeepSeek-V4-Flash rep1 — OK
[893/900] TC098 x DeepSeek-V4-Flash rep2 — OK
[894/900] TC098 x DeepSeek-V4-Flash rep3 — OK
[895/900] TC099 x DeepSeek-V4-Flash rep1 — OK
[896/900] TC099 x DeepSeek-V4-Flash rep2 — OK
[897/900] TC099 x DeepSeek-V4-Flash rep3 — OK
[898/900] TC100 x DeepSeek-V4-Flash rep1 — MISMATCH(UNNECESSARY_TOOL_CALL)
[899/900] TC100 x DeepSeek-V4-Flash rep2 — MISMATCH(UNNECESSARY_TOOL_CALL)
[900/900] TC100 x DeepSeek-V4-Flash rep3 — MISMATCH(UNNECESSARY_TOOL_CALL)

Done. Run: run-2026-09-06-1036
Raw results: evaluation/results/run-2026-09-06-1036/raw-results.jsonl
Reports: evaluation/results/run-2026-09-06-1036/summary.json + tabel-4.x CSVs
```
