import re
import Rust
import BasePlayer
import StringPool


class PythonTests:

	def __init__(self):

		#PLUGIN INFO
		self.Title = 'Python Tests'
		self.Author = 'KillParadise'
		self.Version = V(1, 0, 0)

	def LoadDefaultConfig(self):

		self.Config.Version = "1.0.0"

		def init(self):

			command.AddChatCommand('py', self.Plugin, 'runTests')

		def runTests(player, cmd, args):

			print(API.test(true));

