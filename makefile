ENV ?= production
ENV_FILE = .env.$(ENV)

ifneq (,$(wildcard $(ENV_FILE)))
    include $(ENV_FILE)
    export $(shell sed 's/=.*//' $(ENV_FILE))
else
    $(error "Environment file $(ENV_FILE) not found!")
endif

build:
	@echo "📦 Installing & Building Project..."
	npm install
	npm run build

deploy: build
	@echo "🚀 Deploying to $(ENV) ($(SERVER_USER)@$(SERVER_HOST))..."

	# Buat folder remote jika belum ada
	ssh -p $(SERVER_PORT) $(SERVER_USER)@$(SERVER_HOST) "mkdir -p $(SERVER_REMOTE_DIR)/build"

	# Upload folder build
	rsync -avz -e "ssh -p $(SERVER_PORT)" --delete ./build/ \
		$(SERVER_USER)@$(SERVER_HOST):$(SERVER_REMOTE_DIR)/build

	# Upload file penting
	rsync -avz -e "ssh -p $(SERVER_PORT)" package.json package-lock.json .sequelizerc \
		$(SERVER_USER)@$(SERVER_HOST):$(SERVER_REMOTE_DIR)/

	# Upload .env.production sebagai .env di server
	scp -P $(SERVER_PORT) $(ENV_FILE) $(SERVER_USER)@$(SERVER_HOST):$(SERVER_REMOTE_DIR)/.env

	# Install dependencies di VPS dan restart pm2
	ssh -p $(SERVER_PORT) $(SERVER_USER)@$(SERVER_HOST) "\
		cd $(SERVER_REMOTE_DIR) && \
		npm install --omit=dev && \
		pm2 restart satuflow-api || pm2 start build/src/server.js --name satuflow-api \
	"

logs:
	ssh -p $(SERVER_PORT) $(SERVER_USER)@$(SERVER_HOST) "pm2 logs satuflow-api --lines 50"

restart:
	ssh -p $(SERVER_PORT) $(SERVER_USER)@$(SERVER_HOST) "pm2 restart satuflow-api"

status:
	ssh -p $(SERVER_PORT) $(SERVER_USER)@$(SERVER_HOST) "pm2 status satuflow-api"
