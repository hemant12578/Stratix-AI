"""
MCP (Model Context Protocol) API Routes
Provides MCP tool capabilities for Claude and other AI models
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict
from app.core.mcp_tools import get_mcp_tools, handle_tool_call

router = APIRouter()


class MCPToolCall(BaseModel):
    tool_name: str
    tool_input: Dict[str, Any]


class MCPToolResponse(BaseModel):
    tool_name: str
    result: Dict[str, Any]


@router.get("/mcp/tools")
async def get_available_tools():
    """Get list of available MCP tools"""
    return {
        "status": "success",
        "tools": get_mcp_tools(),
        "count": len(get_mcp_tools())
    }


@router.post("/mcp/call")
async def call_mcp_tool(request: MCPToolCall) -> MCPToolResponse:
    """
    Call an MCP tool
    
    Request body:
    {
        "tool_name": "analyze_dataset",
        "tool_input": {
            "dataset_path": "/data/sample.csv",
            "analysis_type": "summary"
        }
    }
    """
    try:
        result = handle_tool_call(request.tool_name, request.tool_input)
        return MCPToolResponse(
            tool_name=request.tool_name,
            result=result
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"MCP tool call failed: {str(e)}"
        )


@router.get("/mcp/tool/{tool_name}")
async def get_tool_schema(tool_name: str):
    """Get schema for a specific MCP tool"""
    tools = get_mcp_tools()
    for tool in tools:
        if tool["name"] == tool_name:
            return {"status": "success", "tool": tool}
    
    raise HTTPException(
        status_code=404,
        detail=f"Tool '{tool_name}' not found"
    )
