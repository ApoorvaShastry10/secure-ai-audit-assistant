from dataclasses import dataclass
from starlette.status import HTTP_400_BAD_REQUEST

@dataclass
class AppError(Exception):
    message: str
    status_code: int = HTTP_400_BAD_REQUEST
    code: str = "APP_ERROR"
