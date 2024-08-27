
```
social-media
├─ .vscode
│  └─ settings.json
├─ config
│  ├─ cloudinary.js
│  ├─ DB.js
│  └─ server.js
├─ config.env
├─ controllers
│  ├─ authController.js
│  ├─ commentController.js
│  ├─ likeController.js
│  ├─ postController.js
│  └─ userController.js
├─ index.js
├─ middlewares
│  ├─ authValidation
│  │  ├─ auth.js
│  │  ├─ verifyAccessToken.js
│  │  └─ verifyRefreshToken.js
│  ├─ globalErrorhandler.js
│  ├─ multer.js
│  ├─ uploadImage.js
│  └─ validateObjectID.js
├─ models
│  ├─ commentModel.js
│  ├─ postModel.js
│  └─ userModel.js
├─ package-lock.json
├─ package.json
├─ README.md
├─ routers
│  ├─ authRouter.js
│  ├─ commentRouter.js
│  ├─ likeRouter.js
│  ├─ postRouter.js
│  └─ userRouter.js
├─ services
│  ├─ mailService
│  │  ├─ generateOTP.js
│  │  ├─ mailForm.js
│  │  ├─ resetPassMail.js
│  │  └─ verificationMail.js
│  └─ token_management
│     ├─ checkTokenDate.js
│     ├─ createToken.js
│     ├─ generateTokensFullProcess.js
│     └─ handleTokenRefresh.js
├─ test.js
└─ Utils
   ├─ apiError.js
   ├─ catchAsync.js
   ├─ factoryHandler.js
   ├─ Pipelines.js
   ├─ queryProcesses.js
   └─ rules.js

```