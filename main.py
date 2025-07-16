from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.templating import Jinja2Templates
import cv2

app = FastAPI()
templates = Jinja2Templates(directory="webcontent")