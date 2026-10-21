import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { MenuResponseDto, MenuTreeNodeDto } from './dto/menu-response.dto';
import { ErrorResponseDto } from '../common/dto/error-response.dto';

@ApiTags('menus')
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get()
  @ApiOperation({
    summary: 'Get full menu tree',
    description:
      'Returns a hierarchical tree of menu items with nested children, ordered by sibling position.',
  })
  @ApiOkResponse({
    description: 'Tree of menus successfully retrieved',
    type: [MenuTreeNodeDto],
  })
  async getTree(): Promise<MenuTreeNodeDto[]> {
    return this.menusService.getTree();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get single menu details by ID',
    description:
      'Returns detailed menu item with derived depth and parent name.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Menu UUID',
  })
  @ApiOkResponse({
    description: 'Menu item details',
    type: MenuResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID provided',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Menu not found',
    type: ErrorResponseDto,
  })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<MenuResponseDto> {
    return this.menusService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new menu item',
    description:
      'Creates a new menu item either as a root or child of parentId. Appends to the end of siblings.',
  })
  @ApiBody({ type: CreateMenuDto })
  @ApiCreatedResponse({
    description: 'Menu item created successfully',
    type: MenuResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Parent menu not found',
    type: ErrorResponseDto,
  })
  async create(@Body() createMenuDto: CreateMenuDto): Promise<MenuResponseDto> {
    return this.menusService.create(createMenuDto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update menu name',
    description:
      'Updates the name of an existing menu item. Moving must use the /move endpoint.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Menu UUID',
  })
  @ApiBody({ type: UpdateMenuDto })
  @ApiOkResponse({
    description: 'Menu item updated successfully',
    type: MenuResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID or invalid name',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Menu not found',
    type: ErrorResponseDto,
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateMenuDto: UpdateMenuDto,
  ): Promise<MenuResponseDto> {
    return this.menusService.update(id, updateMenuDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete menu item and all descendants',
    description:
      'Removes the menu item and all its descendants. Recompacts remaining sibling positions.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Menu UUID',
  })
  @ApiNoContentResponse({
    description: 'Menu and all descendants deleted successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID provided',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Menu not found',
    type: ErrorResponseDto,
  })
  async delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.menusService.delete(id);
  }
}
