/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/clinical-images/analyze/route";
exports.ids = ["app/api/clinical-images/analyze/route"];
exports.modules = {

/***/ "(rsc)/../../node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fclinical-images%2Fanalyze%2Froute&page=%2Fapi%2Fclinical-images%2Fanalyze%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fclinical-images%2Fanalyze%2Froute.ts&appDir=C%3A%5CUsers%5CRyo%5CDocuments%5CAI%5CApps%5CNexWave%20Solutions%5CClinicPro%5Capps%5Csaas-app%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CRyo%5CDocuments%5CAI%5CApps%5CNexWave%20Solutions%5CClinicPro%5Capps%5Csaas-app&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ../../node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fclinical-images%2Fanalyze%2Froute&page=%2Fapi%2Fclinical-images%2Fanalyze%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fclinical-images%2Fanalyze%2Froute.ts&appDir=C%3A%5CUsers%5CRyo%5CDocuments%5CAI%5CApps%5CNexWave%20Solutions%5CClinicPro%5Capps%5Csaas-app%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CRyo%5CDocuments%5CAI%5CApps%5CNexWave%20Solutions%5CClinicPro%5Capps%5Csaas-app&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/../../node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/../../node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/../../node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_Ryo_Documents_AI_Apps_NexWave_Solutions_ClinicPro_apps_saas_app_app_api_clinical_images_analyze_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/clinical-images/analyze/route.ts */ \"(rsc)/./app/api/clinical-images/analyze/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/clinical-images/analyze/route\",\n        pathname: \"/api/clinical-images/analyze\",\n        filename: \"route\",\n        bundlePath: \"app/api/clinical-images/analyze/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\Ryo\\\\Documents\\\\AI\\\\Apps\\\\NexWave Solutions\\\\ClinicPro\\\\apps\\\\saas-app\\\\app\\\\api\\\\clinical-images\\\\analyze\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_Ryo_Documents_AI_Apps_NexWave_Solutions_ClinicPro_apps_saas_app_app_api_clinical_images_analyze_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi4vLi4vbm9kZV9tb2R1bGVzL25leHQvZGlzdC9idWlsZC93ZWJwYWNrL2xvYWRlcnMvbmV4dC1hcHAtbG9hZGVyL2luZGV4LmpzP25hbWU9YXBwJTJGYXBpJTJGY2xpbmljYWwtaW1hZ2VzJTJGYW5hbHl6ZSUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGY2xpbmljYWwtaW1hZ2VzJTJGYW5hbHl6ZSUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmNsaW5pY2FsLWltYWdlcyUyRmFuYWx5emUlMkZyb3V0ZS50cyZhcHBEaXI9QyUzQSU1Q1VzZXJzJTVDUnlvJTVDRG9jdW1lbnRzJTVDQUklNUNBcHBzJTVDTmV4V2F2ZSUyMFNvbHV0aW9ucyU1Q0NsaW5pY1BybyU1Q2FwcHMlNUNzYWFzLWFwcCU1Q2FwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9QyUzQSU1Q1VzZXJzJTVDUnlvJTVDRG9jdW1lbnRzJTVDQUklNUNBcHBzJTVDTmV4V2F2ZSUyMFNvbHV0aW9ucyU1Q0NsaW5pY1BybyU1Q2FwcHMlNUNzYWFzLWFwcCZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBK0Y7QUFDdkM7QUFDcUI7QUFDK0U7QUFDNUo7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHlHQUFtQjtBQUMzQztBQUNBLGNBQWMsa0VBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxzREFBc0Q7QUFDOUQ7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDMEY7O0FBRTFGIiwic291cmNlcyI6WyIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkM6XFxcXFVzZXJzXFxcXFJ5b1xcXFxEb2N1bWVudHNcXFxcQUlcXFxcQXBwc1xcXFxOZXhXYXZlIFNvbHV0aW9uc1xcXFxDbGluaWNQcm9cXFxcYXBwc1xcXFxzYWFzLWFwcFxcXFxhcHBcXFxcYXBpXFxcXGNsaW5pY2FsLWltYWdlc1xcXFxhbmFseXplXFxcXHJvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9jbGluaWNhbC1pbWFnZXMvYW5hbHl6ZS9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2NsaW5pY2FsLWltYWdlcy9hbmFseXplXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9jbGluaWNhbC1pbWFnZXMvYW5hbHl6ZS9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkM6XFxcXFVzZXJzXFxcXFJ5b1xcXFxEb2N1bWVudHNcXFxcQUlcXFxcQXBwc1xcXFxOZXhXYXZlIFNvbHV0aW9uc1xcXFxDbGluaWNQcm9cXFxcYXBwc1xcXFxzYWFzLWFwcFxcXFxhcHBcXFxcYXBpXFxcXGNsaW5pY2FsLWltYWdlc1xcXFxhbmFseXplXFxcXHJvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgd29ya0FzeW5jU3RvcmFnZSxcbiAgICAgICAgd29ya1VuaXRBc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/../../node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fclinical-images%2Fanalyze%2Froute&page=%2Fapi%2Fclinical-images%2Fanalyze%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fclinical-images%2Fanalyze%2Froute.ts&appDir=C%3A%5CUsers%5CRyo%5CDocuments%5CAI%5CApps%5CNexWave%20Solutions%5CClinicPro%5Capps%5Csaas-app%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CRyo%5CDocuments%5CAI%5CApps%5CNexWave%20Solutions%5CClinicPro%5Capps%5Csaas-app&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/../../node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!**********************************************************************************************************!*\
  !*** ../../node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \**********************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(rsc)/./app/api/clinical-images/analyze/route.ts":
/*!**************************************************!*\
  !*** ./app/api/clinical-images/analyze/route.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var _anthropic_ai_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @anthropic-ai/sdk */ \"(rsc)/../../node_modules/@anthropic-ai/sdk/index.mjs\");\n/* harmony import */ var _aws_sdk_client_s3__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @aws-sdk/client-s3 */ \"@aws-sdk/client-s3\");\n/* harmony import */ var _aws_sdk_client_s3__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_aws_sdk_client_s3__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _aws_sdk_s3_request_presigner__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @aws-sdk/s3-request-presigner */ \"(rsc)/../../node_modules/@aws-sdk/s3-request-presigner/dist-es/index.js\");\n/* harmony import */ var _clerk_nextjs_server__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @clerk/nextjs/server */ \"(rsc)/../../node_modules/@clerk/nextjs/dist/esm/app-router/server/auth.js\");\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/server */ \"(rsc)/../../node_modules/next/dist/api/server.js\");\n\n\n\n\n\nconst anthropic = new _anthropic_ai_sdk__WEBPACK_IMPORTED_MODULE_0__[\"default\"]({\n    apiKey: process.env.ANTHROPIC_API_KEY\n});\nconst s3Client = new _aws_sdk_client_s3__WEBPACK_IMPORTED_MODULE_1__.S3Client({\n    region: process.env.AWS_REGION || 'ap-southeast-2',\n    credentials: {\n        accessKeyId: process.env.AWS_ACCESS_KEY_ID,\n        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY\n    }\n});\nconst BUCKET_NAME = process.env.S3_BUCKET_NAME;\nasync function POST(req) {\n    try {\n        // Authentication\n        const { userId } = await (0,_clerk_nextjs_server__WEBPACK_IMPORTED_MODULE_4__.auth)();\n        if (!userId) {\n            return next_server__WEBPACK_IMPORTED_MODULE_3__.NextResponse.json({\n                error: 'Unauthorized'\n            }, {\n                status: 401\n            });\n        }\n        // Parse request body\n        const { imageKey, patientSessionId, imageId } = await req.json();\n        // Validate required fields\n        if (!imageKey || !patientSessionId || !imageId) {\n            return next_server__WEBPACK_IMPORTED_MODULE_3__.NextResponse.json({\n                error: 'Missing required fields: imageKey, patientSessionId, imageId'\n            }, {\n                status: 400\n            });\n        }\n        // Validate that the key belongs to a consultation (security check)\n        if (!imageKey.startsWith('consultations/')) {\n            return next_server__WEBPACK_IMPORTED_MODULE_3__.NextResponse.json({\n                error: 'Invalid image key'\n            }, {\n                status: 400\n            });\n        }\n        // Generate presigned URL for Claude to access the image\n        const command = new _aws_sdk_client_s3__WEBPACK_IMPORTED_MODULE_1__.GetObjectCommand({\n            Bucket: BUCKET_NAME,\n            Key: imageKey\n        });\n        const presignedUrl = await (0,_aws_sdk_s3_request_presigner__WEBPACK_IMPORTED_MODULE_2__.getSignedUrl)(s3Client, command, {\n            expiresIn: 3600\n        });\n        // Clinical prompt template\n        const systemPrompt = `You are a clinical AI assistant analysing medical images for healthcare documentation.\n\nIMPORTANT GUIDELINES:\n- This is a clinical documentation aid, not a diagnostic tool\n- All observations should be verified by qualified healthcare professionals\n- Focus on objective visual findings, not diagnostic conclusions\n- Use professional medical terminology\n- Be specific about anatomical locations and characteristics\n- Include measurements or scale references when visible\n- Flag any image quality issues that might affect interpretation\n\nINSTRUCTIONS:\n1. Provide a clear, clinical description of what you observe\n2. Note any concerning findings that may require attention\n3. Use professional medical terminology\n4. Be specific about anatomical locations and characteristics\n5. Include measurements or scale references when visible\n6. Flag any image quality issues that might affect interpretation\n\nPlease analyse this clinical image and provide a comprehensive clinical description:`;\n        // Call Claude Vision API with streaming\n        const stream = await anthropic.messages.create({\n            model: 'claude-3-5-sonnet-20241022',\n            max_tokens: 1000,\n            temperature: 0.1,\n            system: systemPrompt,\n            messages: [\n                {\n                    role: 'user',\n                    content: [\n                        {\n                            type: 'image',\n                            source: {\n                                type: 'url',\n                                url: presignedUrl\n                            }\n                        },\n                        {\n                            type: 'text',\n                            text: 'Please provide a detailed clinical analysis of this image.'\n                        }\n                    ]\n                }\n            ],\n            stream: true\n        });\n        // Stream the response to the client\n        const encoder = new TextEncoder();\n        const readable = new ReadableStream({\n            async start (controller) {\n                try {\n                    // Send initial status\n                    const initialData = JSON.stringify({\n                        imageId,\n                        status: 'processing',\n                        description: ''\n                    });\n                    controller.enqueue(encoder.encode(`data: ${initialData}\\n\\n`));\n                    let description = '';\n                    for await (const chunk of stream){\n                        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {\n                            description += chunk.delta.text;\n                            // Send incremental update with safe JSON serialization\n                            try {\n                                const updateData = JSON.stringify({\n                                    imageId,\n                                    status: 'processing',\n                                    description\n                                });\n                                controller.enqueue(encoder.encode(`data: ${updateData}\\n\\n`));\n                            } catch (jsonError) {\n                                console.error('Failed to serialize update data:', jsonError);\n                                // Send a safe fallback\n                                const safeUpdate = JSON.stringify({\n                                    imageId,\n                                    status: 'processing',\n                                    description: '[Processing...]'\n                                });\n                                controller.enqueue(encoder.encode(`data: ${safeUpdate}\\n\\n`));\n                            }\n                        }\n                    }\n                    // Send completion status with safe JSON serialization\n                    try {\n                        const completionData = JSON.stringify({\n                            imageId,\n                            status: 'completed',\n                            description,\n                            metadata: {\n                                processingTime: Date.now(),\n                                modelUsed: 'claude-3-5-sonnet-20241022'\n                            }\n                        });\n                        controller.enqueue(encoder.encode(`data: ${completionData}\\n\\n`));\n                    } catch (jsonError) {\n                        console.error('Failed to serialize completion data:', jsonError);\n                        // Send error status\n                        const errorData = JSON.stringify({\n                            imageId,\n                            status: 'error',\n                            error: 'Failed to process analysis result'\n                        });\n                        controller.enqueue(encoder.encode(`data: ${errorData}\\n\\n`));\n                    }\n                    controller.close();\n                } catch (error) {\n                    console.error('Streaming error:', error);\n                    // Send error status\n                    const errorData = JSON.stringify({\n                        imageId,\n                        status: 'error',\n                        error: error instanceof Error ? error.message : 'Analysis failed'\n                    });\n                    controller.enqueue(encoder.encode(`data: ${errorData}\\n\\n`));\n                    controller.close();\n                }\n            }\n        });\n        return new Response(readable, {\n            headers: {\n                'Content-Type': 'text/event-stream',\n                'Cache-Control': 'no-cache',\n                'Connection': 'keep-alive',\n                'Access-Control-Allow-Origin': '*',\n                'Access-Control-Allow-Methods': 'POST',\n                'Access-Control-Allow-Headers': 'Content-Type, Authorization'\n            }\n        });\n    } catch (error) {\n        console.error('AI analysis error:', error);\n        // Handle timeout errors specifically\n        if (error instanceof Error && error.message.includes('timeout')) {\n            return next_server__WEBPACK_IMPORTED_MODULE_3__.NextResponse.json({\n                error: 'Analysis timed out. Please try again.',\n                code: 'TIMEOUT_ERROR'\n            }, {\n                status: 408\n            });\n        }\n        // Handle rate limiting\n        if (error instanceof Error && error.message.includes('rate limit')) {\n            return next_server__WEBPACK_IMPORTED_MODULE_3__.NextResponse.json({\n                error: 'Too many requests. Please wait a moment and try again.',\n                code: 'RATE_LIMIT_ERROR'\n            }, {\n                status: 429\n            });\n        }\n        return next_server__WEBPACK_IMPORTED_MODULE_3__.NextResponse.json({\n            error: 'Failed to analyse image',\n            code: 'INTERNAL_ERROR',\n            details:  true ? error : 0\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2NsaW5pY2FsLWltYWdlcy9hbmFseXplL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBMEM7QUFDc0I7QUFDSDtBQUNqQjtBQUNEO0FBRTNDLE1BQU1NLFlBQVksSUFBSU4seURBQVNBLENBQUM7SUFDOUJPLFFBQVFDLFFBQVFDLEdBQUcsQ0FBQ0MsaUJBQWlCO0FBQ3ZDO0FBRUEsTUFBTUMsV0FBVyxJQUFJVCx3REFBUUEsQ0FBQztJQUM1QlUsUUFBUUosUUFBUUMsR0FBRyxDQUFDSSxVQUFVLElBQUk7SUFDbENDLGFBQWE7UUFDWEMsYUFBYVAsUUFBUUMsR0FBRyxDQUFDTyxpQkFBaUI7UUFDMUNDLGlCQUFpQlQsUUFBUUMsR0FBRyxDQUFDUyxxQkFBcUI7SUFDcEQ7QUFDRjtBQUVBLE1BQU1DLGNBQWNYLFFBQVFDLEdBQUcsQ0FBQ1csY0FBYztBQUV2QyxlQUFlQyxLQUFLQyxHQUFZO0lBQ3JDLElBQUk7UUFDRixpQkFBaUI7UUFDakIsTUFBTSxFQUFFQyxNQUFNLEVBQUUsR0FBRyxNQUFNbkIsMERBQUlBO1FBQzdCLElBQUksQ0FBQ21CLFFBQVE7WUFDWCxPQUFPbEIscURBQVlBLENBQUNtQixJQUFJLENBQUM7Z0JBQUVDLE9BQU87WUFBZSxHQUFHO2dCQUFFQyxRQUFRO1lBQUk7UUFDcEU7UUFFQSxxQkFBcUI7UUFDckIsTUFBTSxFQUFFQyxRQUFRLEVBQUVDLGdCQUFnQixFQUFFQyxPQUFPLEVBQUUsR0FBRyxNQUFNUCxJQUFJRSxJQUFJO1FBRTlELDJCQUEyQjtRQUMzQixJQUFJLENBQUNHLFlBQVksQ0FBQ0Msb0JBQW9CLENBQUNDLFNBQVM7WUFDOUMsT0FBT3hCLHFEQUFZQSxDQUFDbUIsSUFBSSxDQUFDO2dCQUN2QkMsT0FBTztZQUNULEdBQUc7Z0JBQUVDLFFBQVE7WUFBSTtRQUNuQjtRQUVBLG1FQUFtRTtRQUNuRSxJQUFJLENBQUNDLFNBQVNHLFVBQVUsQ0FBQyxtQkFBbUI7WUFDMUMsT0FBT3pCLHFE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SSxDQUFDO1lBQ3ZCQyxPQUFPO1lBQ1B3RCxNQUFNO1lBQ05DLFNBQVMxRSxLQUFzQyxHQUFHaUIsUUFBUTBELENBQVNBO1FBQ3JFLEdBQUc7WUFBRXpELFFBQVE7UUFBSTtJQUNuQjtBQUNGIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXFJ5b1xcRG9jdW1lbnRzXFxBSVxcQXBwc1xcTmV4V2F2ZSBTb2x1dGlvbnNcXENsaW5pY1Byb1xcYXBwc1xcc2Fhcy1hcHBcXGFwcFxcYXBpXFxjbGluaWNhbC1pbWFnZXNcXGFuYWx5emVcXHJvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBBbnRocm9waWMgZnJvbSAnQGFudGhyb3BpYy1haS9zZGsnO1xyXG5pbXBvcnQgeyBHZXRPYmplY3RDb21tYW5kLCBTM0NsaWVudCB9IGZyb20gJ0Bhd3Mtc2RrL2NsaWVudC1zMyc7XHJcbmltcG9ydCB7IGdldFNpZ25lZFVybCB9IGZyb20gJ0Bhd3Mtc2RrL3MzLXJlcXVlc3QtcHJlc2lnbmVyJztcclxuaW1wb3J0IHsgYXV0aCB9IGZyb20gJ0BjbGVyay9uZXh0anMvc2VydmVyJztcclxuaW1wb3J0IHsgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInO1xyXG5cclxuY29uc3QgYW50aHJvcGljID0gbmV3IEFudGhyb3BpYyh7XHJcbiAgYXBpS2V5OiBwcm9jZXNzLmVudi5BTlRIUk9QSUNfQVBJX0tFWSEsXHJcbn0pO1xyXG5cclxuY29uc3QgczNDbGllbnQgPSBuZXcgUzNDbGllbnQoe1xyXG4gIHJlZ2lvbjogcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiB8fCAnYXAtc291dGhlYXN0LTInLFxyXG4gIGNyZWRlbnRpYWxzOiB7XHJcbiAgICBhY2Nlc3NLZXlJZDogcHJvY2Vzcy5lbnYuQVdTX0FDQ0VTU19LRVlfSUQhLFxyXG4gICAgc2VjcmV0QWNjZXNzS2V5OiBwcm9jZXNzLmVudi5BV1NfU0VDUkVUX0FDQ0VTU19LRVkhLFxyXG4gIH0sXHJcbn0pO1xyXG5cclxuY29uc3QgQlVDS0VUX05BTUUgPSBwcm9jZXNzLmVudi5TM19CVUNLRVRfTkFNRSE7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChyZXE6IFJlcXVlc3QpIHtcclxuICB0cnkge1xyXG4gICAgLy8gQXV0aGVudGljYXRpb25cclxuICAgIGNvbnN0IHsgdXNlcklkIH0gPSBhd2FpdCBhdXRoKCk7XHJcbiAgICBpZiAoIXVzZXJJZCkge1xyXG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ1VuYXV0aG9yaXplZCcgfSwgeyBzdGF0dXM6IDQwMSB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQYXJzZSByZXF1ZXN0IGJvZHlcclxuICAgIGNvbnN0IHsgaW1hZ2VLZXksIHBhdGllbnRTZXNzaW9uSWQsIGltYWdlSWQgfSA9IGF3YWl0IHJlcS5qc29uKCk7XHJcblxyXG4gICAgLy8gVmFsaWRhdGUgcmVxdWlyZWQgZmllbGRzXHJcbiAgICBpZiAoIWltYWdlS2V5IHx8ICFwYXRpZW50U2Vzc2lvbklkIHx8ICFpbWFnZUlkKSB7XHJcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7XHJcbiAgICAgICAgZXJyb3I6ICdNaXNzaW5nIHJlcXVpcmVkIGZpZWxkczogaW1hZ2VLZXksIHBhdGllbnRTZXNzaW9uSWQsIGltYWdlSWQnLFxyXG4gICAgICB9LCB7IHN0YXR1czogNDAwIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFZhbGlkYXRlIHRoYXQgdGhlIGtleSBiZWxvbmdzIHRvIGEgY29uc3VsdGF0aW9uIChzZWN1cml0eSBjaGVjaylcclxuICAgIGlmICghaW1hZ2VLZXkuc3RhcnRzV2l0aCgnY29uc3VsdGF0aW9ucy8nKSkge1xyXG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ0ludmFsaWQgaW1hZ2Uga2V5JyB9LCB7IHN0YXR1czogNDAwIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEdlbmVyYXRlIHByZXNpZ25lZCBVUkwgZm9yIENsYXVkZSB0byBhY2Nlc3MgdGhlIGltYWdlXHJcbiAgICBjb25zdCBjb21tYW5kID0gbmV3IEdldE9iamVjdENvbW1hbmQoe1xyXG4gICAgICBCdWNrZXQ6IEJVQ0tFVF9OQU1FLFxyXG4gICAgICBLZXk6IGltYWdlS2V5LFxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgcHJlc2lnbmVkVXJsID0gYXdhaXQgZ2V0U2lnbmVkVXJsKHMzQ2xpZW50LCBjb21tYW5kLCB7XHJcbiAgICAgIGV4cGlyZXNJbjogMzYwMCwgLy8gMSBob3VyIC0gcGxlbnR5IG9mIHRpbWUgZm9yIENsYXVkZSB0byBhY2Nlc3NcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIENsaW5pY2FsIHByb21wdCB0ZW1wbGF0ZVxyXG4gICAgY29uc3Qgc3lzdGVtUHJvbXB0ID0gYFlvdSBhcmUgYSBjbGluaWNhbCBBSSBhc3Npc3RhbnQgYW5hbHlzaW5nIG1lZGljYWwgaW1hZ2VzIGZvciBoZWFsdGhjYXJlIGRvY3VtZW50YXRpb24uXHJcblxyXG5JTVBPUlRBTlQgR1VJREVMSU5FUzpcclxuLSBUaGlzIGlzIGEgY2xpbmljYWwgZG9jdW1lbnRhdGlvbiBhaWQsIG5vdCBhIGRpYWdub3N0aWMgdG9vbFxyXG4tIEFsbCBvYnNlcnZhdGlvbnMgc2hvdWxkIGJlIHZlcmlmaWVkIGJ5IHF1YWxpZmllZCBoZWFsdGhjYXJlIHByb2Zlc3Npb25hbHNcclxuLSBGb2N1cyBvbiBvYmplY3RpdmUgdmlzdWFsIGZpbmRpbmdzLCBub3QgZGlhZ25vc3RpYyBjb25jbHVzaW9uc1xyXG4tIFVzZSBwcm9mZXNzaW9uYWwgbWVkaWNhbCB0ZXJtaW5vbG9neVxyXG4tIEJlIHNwZWNpZmljIGFib3V0IGFuYXRvbWljYWwgbG9jYXRpb25zIGFuZCBjaGFyYWN0ZXJpc3RpY3NcclxuLSBJbmNsdWRlIG1lYXN1cmVtZW50cyBvciBzY2FsZSByZWZlcmVuY2VzIHdoZW4gdmlzaWJsZVxyXG4tIEZsYWcgYW55IGltYWdlIHF1YWxpdHkgaXNzdWVzIHRoYXQgbWlnaHQgYWZmZWN0IGludGVycHJldGF0aW9uXHJcblxyXG5JTlNUUlVDVElPTlM6XHJcbjEuIFByb3ZpZGUgYSBjbGVhciwgY2xpbmljYWwgZGVzY3JpcHRpb24gb2Ygd2hhdCB5b3Ugb2JzZXJ2ZVxyXG4yLiBOb3RlIGFueSBjb25jZXJuaW5nIGZpbmRpbmdzIHRoYXQgbWF5IHJlcXVpcmUgYXR0ZW50aW9uXHJcbjMuIFVzZSBwcm9mZXNzaW9uYWwgbWVkaWNhbCB0ZXJtaW5vbG9neVxyXG40LiBCZSBzcGVjaWZpYyBhYm91dCBhbmF0b21pY2FsIGxvY2F0aW9ucyBhbmQgY2hhcmFjdGVyaXN0aWNzXHJcbjUuIEluY2x1ZGUgbWVhc3VyZW1lbnRzIG9yIHNjYWxlIHJlZmVyZW5jZXMgd2hlbiB2aXNpYmxlXHJcbjYuIEZsYWcgYW55IGltYWdlIHF1YWxpdHkgaXNzdWVzIHRoYXQgbWlnaHQgYWZmZWN0IGludGVycHJldGF0aW9uXHJcblxyXG5QbGVhc2UgYW5hbHlzZSB0aGlzIGNsaW5pY2FsIGltYWdlIGFuZCBwcm92aWRlIGEgY29tcHJlaGVuc2l2ZSBjbGluaWNhbCBkZXNjcmlwdGlvbjpgO1xyXG5cclxuICAgIC8vIENhbGwgQ2xhdWRlIFZpc2lvbiBBUEkgd2l0aCBzdHJlYW1pbmdcclxuICAgIGNvbnN0IHN0cmVhbSA9IGF3YWl0IGFudGhyb3BpYy5tZXNzYWdlcy5jcmVhdGUoe1xyXG4gICAgICBtb2RlbDogJ2NsYXVkZS0zLTUtc29ubmV0LTIwMjQxMDIyJyxcclxuICAgICAgbWF4X3Rva2VuczogMTAwMCxcclxuICAgICAgdGVtcGVyYXR1cmU6IDAuMSwgLy8gTG93IHRlbXBlcmF0dXJlIGZvciBjb25zaXN0ZW50IGNsaW5pY2FsIG9ic2VydmF0aW9uc1xyXG4gICAgICBzeXN0ZW06IHN5c3RlbVByb21wdCxcclxuICAgICAgbWVzc2FnZXM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICByb2xlOiAndXNlcicsXHJcbiAgICAgICAgICBjb250ZW50OiBbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICB0eXBlOiAnaW1hZ2UnLFxyXG4gICAgICAgICAgICAgIHNvdXJjZToge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ3VybCcsXHJcbiAgICAgICAgICAgICAgICB1cmw6IHByZXNpZ25lZFVybCxcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxyXG4gICAgICAgICAgICAgIHRleHQ6ICdQbGVhc2UgcHJvdmlkZSBhIGRldGFpbGVkIGNsaW5pY2FsIGFuYWx5c2lzIG9mIHRoaXMgaW1hZ2UuJyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgfSxcclxuICAgICAgXSxcclxuICAgICAgc3RyZWFtOiB0cnVlLFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU3RyZWFtIHRoZSByZXNwb25zZSB0byB0aGUgY2xpZW50XHJcbiAgICBjb25zdCBlbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XHJcbiAgICBjb25zdCByZWFkYWJsZSA9IG5ldyBSZWFkYWJsZVN0cmVhbSh7XHJcbiAgICAgIGFzeW5jIHN0YXJ0KGNvbnRyb2xsZXIpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgLy8gU2VuZCBpbml0aWFsIHN0YXR1c1xyXG4gICAgICAgICAgY29uc3QgaW5pdGlhbERhdGEgPSBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgICAgIGltYWdlSWQsXHJcbiAgICAgICAgICAgIHN0YXR1czogJ3Byb2Nlc3NpbmcnLFxyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJycsXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShlbmNvZGVyLmVuY29kZShgZGF0YTogJHtpbml0aWFsRGF0YX1cXG5cXG5gKSk7XHJcblxyXG4gICAgICAgICAgbGV0IGRlc2NyaXB0aW9uID0gJyc7XHJcblxyXG4gICAgICAgICAgZm9yIGF3YWl0IChjb25zdCBjaHVuayBvZiBzdHJlYW0pIHtcclxuICAgICAgICAgICAgaWYgKGNodW5rLnR5cGUgPT09ICdjb250ZW50X2Jsb2NrX2RlbHRhJyAmJiBjaHVuay5kZWx0YS50eXBlID09PSAndGV4dF9kZWx0YScpIHtcclxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbiArPSBjaHVuay5kZWx0YS50ZXh0O1xyXG5cclxuICAgICAgICAgICAgICAvLyBTZW5kIGluY3JlbWVudGFsIHVwZGF0ZSB3aXRoIHNhZmUgSlNPTiBzZXJpYWxpemF0aW9uXHJcbiAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZURhdGEgPSBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgICAgICAgICAgIGltYWdlSWQsXHJcbiAgICAgICAgICAgICAgICAgIHN0YXR1czogJ3Byb2Nlc3NpbmcnLFxyXG4gICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlci5lbnF1ZXVlKGVuY29kZXIuZW5jb2RlKGBkYXRhOiAke3VwZGF0ZURhdGF9XFxuXFxuYCkpO1xyXG4gICAgICAgICAgICAgIH0gY2F0Y2ggKGpzb25FcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHNlcmlhbGl6ZSB1cGRhdGUgZGF0YTonLCBqc29uRXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgLy8gU2VuZCBhIHNhZmUgZmFsbGJhY2tcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNhZmVVcGRhdGUgPSBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgICAgICAgICAgIGltYWdlSWQsXHJcbiAgICAgICAgICAgICAgICAgIHN0YXR1czogJ3Byb2Nlc3NpbmcnLFxyXG4gICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1tQcm9jZXNzaW5nLi4uXScsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShlbmNvZGVyLmVuY29kZShgZGF0YTogJHtzYWZlVXBkYXRlfVxcblxcbmApKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBTZW5kIGNvbXBsZXRpb24gc3RhdHVzIHdpdGggc2FmZSBKU09OIHNlcmlhbGl6YXRpb25cclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbXBsZXRpb25EYXRhID0gSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICAgICAgIGltYWdlSWQsXHJcbiAgICAgICAgICAgICAgc3RhdHVzOiAnY29tcGxldGVkJyxcclxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICBtZXRhZGF0YToge1xyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc2luZ1RpbWU6IERhdGUubm93KCksXHJcbiAgICAgICAgICAgICAgICBtb2RlbFVzZWQ6ICdjbGF1ZGUtMy01LXNvbm5ldC0yMDI0MTAyMicsXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShlbmNvZGVyLmVuY29kZShgZGF0YTogJHtjb21wbGV0aW9uRGF0YX1cXG5cXG5gKSk7XHJcbiAgICAgICAgICB9IGNhdGNoIChqc29uRXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHNlcmlhbGl6ZSBjb21wbGV0aW9uIGRhdGE6JywganNvbkVycm9yKTtcclxuICAgICAgICAgICAgLy8gU2VuZCBlcnJvciBzdGF0dXNcclxuICAgICAgICAgICAgY29uc3QgZXJyb3JEYXRhID0gSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICAgICAgIGltYWdlSWQsXHJcbiAgICAgICAgICAgICAgc3RhdHVzOiAnZXJyb3InLFxyXG4gICAgICAgICAgICAgIGVycm9yOiAnRmFpbGVkIHRvIHByb2Nlc3MgYW5hbHlzaXMgcmVzdWx0JyxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShlbmNvZGVyLmVuY29kZShgZGF0YTogJHtlcnJvckRhdGF9XFxuXFxuYCkpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGNvbnRyb2xsZXIuY2xvc2UoKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcignU3RyZWFtaW5nIGVycm9yOicsIGVycm9yKTtcclxuXHJcbiAgICAgICAgICAvLyBTZW5kIGVycm9yIHN0YXR1c1xyXG4gICAgICAgICAgY29uc3QgZXJyb3JEYXRhID0gSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICAgICBpbWFnZUlkLFxyXG4gICAgICAgICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgICAgICAgIGVycm9yOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdBbmFseXNpcyBmYWlsZWQnLFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUoZW5jb2Rlci5lbmNvZGUoYGRhdGE6ICR7ZXJyb3JEYXRhfVxcblxcbmApKTtcclxuXHJcbiAgICAgICAgICBjb250cm9sbGVyLmNsb3NlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShyZWFkYWJsZSwge1xyXG4gICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICd0ZXh0L2V2ZW50LXN0cmVhbScsXHJcbiAgICAgICAgJ0NhY2hlLUNvbnRyb2wnOiAnbm8tY2FjaGUnLFxyXG4gICAgICAgICdDb25uZWN0aW9uJzogJ2tlZXAtYWxpdmUnLFxyXG4gICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXHJcbiAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnUE9TVCcsXHJcbiAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uJyxcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdBSSBhbmFseXNpcyBlcnJvcjonLCBlcnJvcik7XHJcblxyXG4gICAgLy8gSGFuZGxlIHRpbWVvdXQgZXJyb3JzIHNwZWNpZmljYWxseVxyXG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgJiYgZXJyb3IubWVzc2FnZS5pbmNsdWRlcygndGltZW91dCcpKSB7XHJcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7XHJcbiAgICAgICAgZXJyb3I6ICdBbmFseXNpcyB0aW1lZCBvdXQuIFBsZWFzZSB0cnkgYWdhaW4uJyxcclxuICAgICAgICBjb2RlOiAnVElNRU9VVF9FUlJPUicsXHJcbiAgICAgIH0sIHsgc3RhdHVzOiA0MDggfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSGFuZGxlIHJhdGUgbGltaXRpbmdcclxuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yICYmIGVycm9yLm1lc3NhZ2UuaW5jbHVkZXMoJ3JhdGUgbGltaXQnKSkge1xyXG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oe1xyXG4gICAgICAgIGVycm9yOiAnVG9vIG1hbnkgcmVxdWVzdHMuIFBsZWFzZSB3YWl0IGEgbW9tZW50IGFuZCB0cnkgYWdhaW4uJyxcclxuICAgICAgICBjb2RlOiAnUkFURV9MSU1JVF9FUlJPUicsXHJcbiAgICAgIH0sIHsgc3RhdHVzOiA0MjkgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcclxuICAgICAgZXJyb3I6ICdGYWlsZWQgdG8gYW5hbHlzZSBpbWFnZScsXHJcbiAgICAgIGNvZGU6ICdJTlRFUk5BTF9FUlJPUicsXHJcbiAgICAgIGRldGFpbHM6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnID8gZXJyb3IgOiB1bmRlZmluZWQsXHJcbiAgICB9LCB7IHN0YXR1czogNTAwIH0pO1xyXG4gIH1cclxufVxyXG4iXSwibmFtZXMiOlsiQW50aHJvcGljIiwiR2V0T2JqZWN0Q29tbWFuZCIsIlMzQ2xpZW50IiwiZ2V0U2lnbmVkVXJsIiwiYXV0aCIsIk5leHRSZXNwb25zZSIsImFudGhyb3BpYyIsImFwaUtleSIsInByb2Nlc3MiLCJlbnYiLCJBTlRIUk9QSUNfQVBJX0tFWSIsInMzQ2xpZW50IiwicmVnaW9uIiwiQVdTX1JFR0lPTiIsImNyZWRlbnRpYWxzIiwiYWNjZXNzS2V5SWQiLCJBV1NfQUNDRVNTX0tFWV9JRCIsInNlY3JldEFjY2Vzc0tleSIsIkFXU19TRUNSRVRfQUNDRVNTX0tFWSIsIkJVQ0tFVF9OQU1FIiwiUzNfQlVDS0VUX05BTUUiLCJQT1NUIiwicmVxIiwidXNlcklkIiwianNvbiIsImVycm9yIiwic3RhdHVzIiwiaW1hZ2VLZXkiLCJwYXRpZW50U2Vzc2lvbklkIiwiaW1hZ2VJZCIsInN0YXJ0c1dpdGgiLCJjb21tYW5kIiwiQnVja2V0IiwiS2V5IiwicHJlc2lnbmVkVXJsIiwiZXhwaXJlc0luIiwic3lzdGVtUHJvbXB0Iiwic3RyZWFtIiwibWVzc2FnZXMiLCJjcmVhdGUiLCJtb2RlbCIsIm1heF90b2tlbnMiLCJ0ZW1wZXJhdHVyZSIsInN5c3RlbSIsInJvbGUiLCJjb250ZW50IiwidHlwZSIsInNvdXJjZSIsInVybCIsInRleHQiLCJlbmNvZGVyIiwiVGV4dEVuY29kZXIiLCJyZWFkYWJsZSIsIlJlYWRhYmxlU3RyZWFtIiwic3RhcnQiLCJjb250cm9sbGVyIiwiaW5pdGlhbERhdGEiLCJKU09OIiwic3RyaW5naWZ5IiwiZGVzY3JpcHRpb24iLCJlbnF1ZXVlIiwiZW5jb2RlIiwiY2h1bmsiLCJkZWx0YSIsInVwZGF0ZURhdGEiLCJqc29uRXJyb3IiLCJjb25zb2xlIiwic2FmZVVwZGF0ZSIsImNvbXBsZXRpb25EYXRhIiwibWV0YWRhdGEiLCJwcm9jZXNzaW5nVGltZSIsIkRhdGUiLCJub3ciLCJtb2RlbFVzZWQiLCJlcnJvckRhdGEiLCJjbG9zZSIsIkVycm9yIiwibWVzc2FnZSIsIlJlc3BvbnNlIiwiaGVhZGVycyIsImluY2x1ZGVzIiwiY29kZSIsImRldGFpbHMiLCJ1bmRlZmluZWQiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/clinical-images/analyze/route.ts\n");

/***/ }),

/***/ "(ssr)/../../node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!**********************************************************************************************************!*\
  !*** ../../node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \**********************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/server/app-render/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/action-async-storage.external.js");

/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "@aws-sdk/client-s3":
/*!*************************************!*\
  !*** external "@aws-sdk/client-s3" ***!
  \*************************************/
/***/ ((module) => {

"use strict";
module.exports = require("@aws-sdk/client-s3");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ "http2":
/*!************************!*\
  !*** external "http2" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("http2");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "node:crypto":
/*!******************************!*\
  !*** external "node:crypto" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:crypto");

/***/ }),

/***/ "node:fs":
/*!**************************!*\
  !*** external "node:fs" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:fs");

/***/ }),

/***/ "node:path":
/*!****************************!*\
  !*** external "node:path" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:path");

/***/ }),

/***/ "node:stream":
/*!******************************!*\
  !*** external "node:stream" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("node:stream");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/@clerk","vendor-chunks/next","vendor-chunks/@opentelemetry","vendor-chunks/tslib","vendor-chunks/cookie","vendor-chunks/map-obj","vendor-chunks/no-case","vendor-chunks/lower-case","vendor-chunks/snakecase-keys","vendor-chunks/snake-case","vendor-chunks/dot-case","vendor-chunks/@smithy","vendor-chunks/@aws-sdk","vendor-chunks/@anthropic-ai"], () => (__webpack_exec__("(rsc)/../../node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fclinical-images%2Fanalyze%2Froute&page=%2Fapi%2Fclinical-images%2Fanalyze%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fclinical-images%2Fanalyze%2Froute.ts&appDir=C%3A%5CUsers%5CRyo%5CDocuments%5CAI%5CApps%5CNexWave%20Solutions%5CClinicPro%5Capps%5Csaas-app%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CRyo%5CDocuments%5CAI%5CApps%5CNexWave%20Solutions%5CClinicPro%5Capps%5Csaas-app&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();